import logger from '@mds-core/mds-logger'
import { isUUID, now, ValidationError, normalizeToArray, NotFoundError, ServerError } from '@mds-core/mds-utils'
import { isValidStop, isValidDevice, validateEvent, isValidTelemetry } from '@mds-core/mds-schema-validators'
import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-agency-cache'
import stream from '@mds-core/mds-stream'
import { providerName } from '@mds-core/mds-providers'
import {
  Device,
  VehicleEvent,
  Telemetry,
  ErrorObject,
  DeviceID,
  VEHICLE_STATES,
  VEHICLE_EVENT,
  UUID,
  VEHICLE_STATE
} from '@mds-core/mds-types'
import urls from 'url'
import { parseRequest } from '@mds-core/mds-api-helpers'
import {
  AgencyApiRequest,
  AgencyApiRegisterVehicleResponse,
  AgencyAipGetVehicleByIdResponse,
  AgencyApiGetVehiclesByProviderRequest,
  AgencyApiGetVehiclesByProviderResponse,
  AgencyApiUpdateVehicleResponse,
  AgencyApiSubmitVehicleEventResponse,
  AgencyApiSubmitVehicleTelemetryResponse,
  AgencyApiRegisterStopResponse,
  AgencyApiReadStopsResponse,
  AgencyApiReadStopResponse,
  AgencyApiGetVehicleByIdRequest,
  AgencyApiUpdateVehicleRequest,
  AgencyApiSubmitVehicleEventRequest,
  AgencyApiSubmitVehicleTelemetryRequest,
  AgencyApiRegisterStopRequest,
  AgencyApiReadStopRequest,
  AgencyApiRegisterVehicleRequest
} from './types'
import {
  badDevice,
  getVehicles,
  lower,
  writeTelemetry,
  badEvent,
  badTelemetry,
  readPayload,
  computeCompositeVehicleData
} from './utils'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
stream.initialize()
const agencyServerError = { error: 'server_error', error_description: 'Unknown server error' }

export const registerVehicle = async (req: AgencyApiRegisterVehicleRequest, res: AgencyApiRegisterVehicleResponse) => {
  const { body } = req
  const recorded = now()

  const { provider_id, version } = res.locals
  if (!version || version === '0.4.1') {
    // convert old body into new body
  }
  // const { device_id, vehicle_id, type, propulsion, year, mfgr, model } = body
  const { device_id, vehicle_id, vehicle_type, propulsion_types, year, mfgr, model } = body

  const status: VEHICLE_STATE = 'removed'

  // const device = {
  //   provider_id,
  //   device_id,
  //   vehicle_id,
  //   type,
  //   propulsion,
  //   year,
  //   mfgr,
  //   model,
  //   recorded,
  //   status
  // }
  const device = {
    provider_id,
    device_id,
    vehicle_id,
    vehicle_type,
    propulsion_types,
    year,
    mfgr,
    model,
    recorded,
    status
  }

  try {
    isValidDevice(device)
  } catch (err) {
    logger.info(`Device ValidationError for ${providerName(provider_id)}. Error: ${JSON.stringify(err)}`)
  }

  const failure = badDevice(device)
  if (failure) {
    return res.status(400).send(failure)
  }

  // writing to the DB is the crucial part.  other failures should be noted as bugs but tolerated
  // and fixed later.
  try {
    await db.writeDevice(device)
    try {
      await Promise.all([cache.writeDevice(device), stream.writeDevice(device)])
    } catch (err) {
      logger.error('failed to write device stream/cache', err)
    }
    logger.info('new', providerName(res.locals.provider_id), 'vehicle added', device)
    res.status(201).send({})
  } catch (err) {
    if (String(err).includes('duplicate')) {
      res.status(409).send({
        error: 'already_registered',
        error_description: 'A vehicle with this device_id is already registered'
      })
    } else if (String(err).includes('db')) {
      logger.error(providerName(res.locals.provider_id), 'register vehicle failed:', err)
      res.status(500).send(agencyServerError)
    } else {
      logger.error(providerName(res.locals.provider_id), 'register vehicle failed:', err)
      res.status(500).send(agencyServerError)
    }
  }
}

export const getVehicleById = async (req: AgencyApiGetVehicleByIdRequest, res: AgencyAipGetVehicleByIdResponse) => {
  const { device_id } = req.params

  const { provider_id } = res.locals.scopes.includes('vehicles:read')
    ? parseRequest(req).single().query('provider_id')
    : res.locals

  const payload = await readPayload(device_id)

  if (!payload.device || (provider_id && payload.device.provider_id !== provider_id)) {
    res.status(404).send({})
    return
  }
  const compositeData = computeCompositeVehicleData(payload)
  res.status(200).send({ ...compositeData })
}

export const getVehiclesByProvider = async (
  req: AgencyApiGetVehiclesByProviderRequest,
  res: AgencyApiGetVehiclesByProviderResponse
) => {
  const PAGE_SIZE = 1000

  const { skip = 0, take = PAGE_SIZE } = parseRequest(req).single({ parser: Number }).query('skip', 'take')

  const url = urls.format({
    protocol: req.get('x-forwarded-proto') || req.protocol,
    host: req.get('host'),
    pathname: req.path
  })

  // TODO: Replace with express middleware
  const { provider_id } = res.locals.scopes.includes('vehicles:read')
    ? parseRequest(req).single().query('provider_id')
    : res.locals

  try {
    const response = await getVehicles(skip, take, url, req.query, provider_id)
    return res.status(200).send({ ...response })
  } catch (err) {
    logger.error('getVehicles fail', err)
    return res.status(500).send(agencyServerError)
  }
}

export async function updateVehicleFail(
  req: AgencyApiRequest,
  res: AgencyApiUpdateVehicleResponse,
  provider_id: UUID,
  device_id: UUID,
  err: Error | string
) {
  if (String(err).includes('not found')) {
    res.status(404).send({})
  } else if (String(err).includes('invalid')) {
    res.status(400).send({
      error: 'bad_param',
      error_description: 'Invalid parameters for vehicle were sent'
    })
  } else if (!provider_id) {
    res.status(404).send({})
  } else {
    logger.error(providerName(provider_id), `fail PUT /vehicles/${device_id}`, req.body, err)
    res.status(500).send(agencyServerError)
  }
}

export const updateVehicle = async (req: AgencyApiUpdateVehicleRequest, res: AgencyApiUpdateVehicleResponse) => {
  const { device_id } = req.params

  const { vehicle_id } = req.body

  const update = {
    vehicle_id
  }

  const { provider_id } = res.locals

  try {
    const tempDevice = await db.readDevice(device_id, provider_id)
    if (tempDevice.provider_id !== provider_id) {
      await updateVehicleFail(req, res, provider_id, device_id, 'not found')
    } else {
      const device = await db.updateDevice(device_id, provider_id, update)
      // TODO should we warn instead of fail if the cache/stream doesn't work?
      try {
        await Promise.all([cache.writeDevice(device), stream.writeDevice(device)])
      } catch (error) {
        logger.warn(`Error writing to cache/stream ${error}`)
      }
      return res.status(201).send({})
    }
  } catch (err) {
    await updateVehicleFail(req, res, provider_id, device_id, 'not found')
  }
}

export const submitVehicleEvent = async (
  req: AgencyApiSubmitVehicleEventRequest,
  res: AgencyApiSubmitVehicleEventResponse
) => {
  const { device_id } = req.params

  const { provider_id } = res.locals
  const name = providerName(provider_id || 'unknown')

  const recorded = now()

  const event: VehicleEvent = {
    device_id: req.params.device_id,
    provider_id: res.locals.provider_id,
    event_types:
      req.body.event_types && Array.isArray(req.body.event_types)
        ? (req.body.event_types.map(lower) as VEHICLE_EVENT[])
        : req.body.event_types, // FIXME: this is super not the best way of doing things. Need to use better validation.
    vehicle_state: req.body.vehicle_state as VEHICLE_STATE,
    telemetry: req.body.telemetry ? { ...req.body.telemetry, provider_id: res.locals.provider_id } : null,
    timestamp: req.body.timestamp,
    trip_id: req.body.trip_id,
    recorded,
    telemetry_timestamp: undefined // added for diagnostic purposes
  }

  try {
    validateEvent(event)
  } catch (err) {
    logger.info(`Event ValidationError for ${providerName(provider_id)}. Error: ${JSON.stringify(err)}`)
  }

  if (event.telemetry) {
    event.telemetry_timestamp = event.telemetry.timestamp
  }

  async function success() {
    function fin() {
      res.status(201).send({
        device_id,
        state: event.vehicle_state
      })
    }
    const delta = now() - recorded

    if (delta > 100) {
      logger.info(name, 'post event took', delta, 'ms')
      fin()
    } else {
      fin()
    }
  }

  /* istanbul ignore next */
  async function fail(err: Error | Partial<{ message: string }>): Promise<void> {
    const message = err.message || String(err)
    if (message.includes('duplicate')) {
      logger.info(name, 'duplicate event', event.event_types)
      res.status(400).send({
        error: 'bad_param',
        error_description: 'An event with this device_id and timestamp has already been received'
      })
    } else if (message.includes('not found') || message.includes('unregistered')) {
      logger.info(name, 'event for unregistered', event.device_id, event.event_types)
      res.status(400).send({
        error: 'unregistered',
        error_description: 'The specified device_id has not been registered'
      })
    } else {
      logger.error('post event fail:', event, message)
      res.status(500).send(agencyServerError)
    }
  }

  // TODO switch to cache for speed?
  try {
    const device = await db.readDevice(event.device_id, provider_id)
    try {
      await cache.readDevice(event.device_id)
    } catch (err) {
      try {
        await Promise.all([cache.writeDevice(device), stream.writeDevice(device)])
        logger.info('Re-adding previously deregistered device to cache', err)
      } catch (error) {
        logger.warn(`Error writing to cache/stream ${error}`)
      }
    }
    if (event.telemetry) {
      event.telemetry.device_id = event.device_id
    }
    const failure = (await badEvent(event)) || (event.telemetry ? badTelemetry(event.telemetry) : null)
    // TODO unify with fail() above
    if (failure) {
      logger.info(name, 'event failure', failure, event)
      return res.status(400).send(failure as any)
    }

    const { telemetry } = event
    if (telemetry) {
      await db.writeTelemetry(normalizeToArray(telemetry))
    }

    // database write is crucial; failures of cache/stream should be noted and repaired
    const recorded_event = await db.writeEvent(event)

    try {
      await Promise.all([cache.writeEvent(recorded_event), stream.writeEvent(recorded_event)])

      if (telemetry) {
        telemetry.recorded = recorded
        await Promise.all([cache.writeTelemetry([telemetry]), stream.writeTelemetry([telemetry])])
      }

      await success()
    } catch (err) {
      logger.warn('/event exception cache/stream', err)
      await success()
    }
  } catch (err) {
    await fail(err)
  }
}

export const submitVehicleTelemetry = async (
  req: AgencyApiSubmitVehicleTelemetryRequest,
  res: AgencyApiSubmitVehicleTelemetryResponse
) => {
  const start = Date.now()

  const { data } = req.body
  const { provider_id } = res.locals
  if (!provider_id) {
    res.status(400).send({
      error: 'bad_param',
      error_description: 'Bad or missing provider_id'
    })
    return
  }
  const name = providerName(provider_id)
  const failures: string[] = []
  const valid: Telemetry[] = []

  const recorded = now()
  const p: Promise<Device | DeviceID[]> =
    data.length === 1 && isUUID(data[0].device_id)
      ? db.readDevice(data[0].device_id, provider_id)
      : db.readDeviceIds(provider_id)
  try {
    const deviceOrDeviceIds = await p
    const deviceIds = Array.isArray(deviceOrDeviceIds) ? deviceOrDeviceIds : [deviceOrDeviceIds]
    for (const item of data) {
      // make sure the device exists
      const { gps } = item
      const telemetry: Telemetry = {
        device_id: item.device_id,
        provider_id,
        timestamp: item.timestamp,
        charge: item.charge,
        gps: {
          lat: gps.lat,
          lng: gps.lng,
          altitude: gps.altitude,
          heading: gps.heading,
          speed: gps.speed,
          accuracy: gps.hdop,
          satellites: gps.satellites
        },
        recorded
      }

      try {
        isValidTelemetry(telemetry)
      } catch (err) {
        logger.info(`Telemetry ValidationError for ${providerName(provider_id)}. Error: ${JSON.stringify(err)}`)
      }

      const bad_telemetry: ErrorObject | null = badTelemetry(telemetry)
      if (bad_telemetry) {
        const msg = `bad telemetry for device_id ${telemetry.device_id}: ${bad_telemetry.error_description}`
        // append to failure
        failures.push(msg)
      } else if (!deviceIds.some(item2 => item2.device_id === telemetry.device_id)) {
        const msg = `device_id ${telemetry.device_id}: not found`
        failures.push(msg)
      } else {
        valid.push(telemetry)
      }
    }

    if (valid.length) {
      const recorded_telemetry = await writeTelemetry(valid)

      const delta = Date.now() - start
      if (delta > 300) {
        logger.info(
          name,
          'writeTelemetry',
          valid.length,
          `(${recorded_telemetry.length} unique)`,
          'took',
          delta,
          `ms (${Math.round((1000 * valid.length) / delta)}/s)`
        )
      }
      if (recorded_telemetry.length) {
        res.status(201).send({
          result: `telemetry success for ${valid.length} of ${data.length}`,
          recorded: now(),
          unique: recorded_telemetry.length,
          failures
        })
      } else {
        logger.info(name, 'no unique telemetry in', data.length, 'items')
        res.status(400).send({
          error: 'invalid_data',
          error_description: 'None of the provided data was valid',
          error_details: failures
        })
      }
    } else {
      const body = `${JSON.stringify(req.body).substring(0, 128)} ...`
      const fails = `${JSON.stringify(failures).substring(0, 128)} ...`
      logger.info(name, 'no valid telemetry in', data.length, 'items:', body, 'failures:', fails)
      res.status(400).send({
        error: 'invalid_data',
        error_description: 'None of the provided data was valid',
        error_details: failures
      })
    }
  } catch (err) {
    res.status(500).send({
      error: 'server_error',
      error_description: 'None of the provided data was valid',
      error_details: [`device_id ${data[0].device_id}: not found`]
    })
  }
}

export const registerStop = async (req: AgencyApiRegisterStopRequest, res: AgencyApiRegisterStopResponse) => {
  const stop = req.body

  try {
    isValidStop(stop)
    const recorded_stop = await db.writeStop(stop)
    return res.status(201).send({ ...recorded_stop })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).send({ error })
    }

    return res.status(500).send({ error: new ServerError() })
  }
}

export const readStop = async (req: AgencyApiReadStopRequest, res: AgencyApiReadStopResponse) => {
  const { stop_id } = req.params
  try {
    const recorded_stop = await db.readStop(stop_id)

    if (!recorded_stop) {
      return res.status(404).send({ error: new NotFoundError('Stop not found') })
    }
    res.status(200).send({ ...recorded_stop })
  } catch (err) {
    res.status(500).send({ error: new ServerError() })
  }
}

export const readStops = async (req: AgencyApiRequest, res: AgencyApiReadStopsResponse) => {
  try {
    const stops = await db.readStops()

    if (!stops) {
      return res.status(404).send({ error: new NotFoundError('No stops were found') })
    }
    res.status(200).send({ stops })
  } catch (err) {
    return res.status(500).send({ error: new ServerError() })
  }
}
