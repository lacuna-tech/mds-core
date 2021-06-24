/**
 * Copyright 2019 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import logger from '@mds-core/mds-logger'
import { isUUID, now, ValidationError, normalizeToArray, ServerError, NotFoundError } from '@mds-core/mds-utils'
import { validateEvent, validateTripMetadata } from '@mds-core/mds-schema-validators'
import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-agency-cache'
import stream from '@mds-core/mds-stream'
import { providerName } from '@mds-core/mds-providers'
import { VehicleEvent, Telemetry, VEHICLE_EVENT, UUID, VEHICLE_STATE, TRIP_STATE } from '@mds-core/mds-types'
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
  AgencyApiGetVehicleByIdRequest,
  AgencyApiUpdateVehicleRequest,
  AgencyApiSubmitVehicleEventRequest,
  AgencyApiSubmitVehicleTelemetryRequest,
  AgencyApiPostTripMetadataRequest,
  AgencyApiPostTripMetadataResponse,
  AgencyApiRegisterVehicleRequest
} from './types'
import {
  getVehicles,
  lower,
  writeTelemetry,
  badEvent,
  badTelemetry,
  readPayload,
  computeCompositeVehicleData,
  agencyValidationErrorParser
} from './utils'
import { isError } from '@mds-core/mds-service-helpers'
import { validateDeviceDomainModel, validateTelemetryDomainModel } from '@mds-core/mds-ingest-service'

const agencyServerError = { error: 'server_error', error_description: 'Unknown server error' }

export const registerVehicle = async (req: AgencyApiRegisterVehicleRequest, res: AgencyApiRegisterVehicleResponse) => {
  const { body } = req
  const recorded = now()

  const { provider_id, version } = res.locals

  if (!version || version === '0.4.1') {
    // TODO: Transform 0.4.1 -> 1.0.0
  }

  try {
    const {
      accessibility_options,
      device_id,
      vehicle_id,
      vehicle_type,
      propulsion_types,
      year,
      mfgr,
      modality,
      model
    } = body

    const status: VEHICLE_STATE = 'removed'

    const unvalidatedDevice = {
      accessibility_options,
      provider_id,
      device_id,
      vehicle_id,
      vehicle_type,
      propulsion_types,
      year,
      mfgr,
      modality,
      model,
      recorded,
      status
    }
    const device = validateDeviceDomainModel(unvalidatedDevice)

    // DB Write is critical, and failures to write to the cache/stream should be considered non-critical (though they are likely indicative of a bug).
    await db.writeDevice(device)
    try {
      await Promise.all([cache.writeDevice(device), stream.writeDevice(device)])
    } catch (error) {
      logger.error('failed to write device stream/cache', error)
    }

    logger.info('new vehicle added', { providerName: providerName(res.locals.provider_id), device })
    return res.status(201).send({})
  } catch (error) {
    if (error instanceof ValidationError) {
      const parsedError = agencyValidationErrorParser(error)
      return res.status(400).send(parsedError)
    }

    if (String(error).includes('duplicate')) {
      return res.status(409).send({
        error: 'already_registered',
        error_description: 'A vehicle with this device_id is already registered'
      })
    }

    logger.error('register vehicle failed:', { err: error, providerName: providerName(res.locals.provider_id) })
    return res.status(500).send(agencyServerError)
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
  error: Error | string
) {
  if (String(error).includes('not found')) {
    res.status(404).send({})
  } else if (String(error).includes('invalid')) {
    res.status(400).send({
      error: 'bad_param',
      error_description: 'Invalid parameters for vehicle were sent'
    })
  } else if (!provider_id) {
    res.status(404).send({})
  } else {
    logger.error(`fail PUT /vehicles/${device_id}`, { providerName: providerName(provider_id), body: req.body, error })
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
    trip_state: req.body.trip_state ? (req.body.trip_state as TRIP_STATE) : null,
    telemetry: req.body.telemetry ? { ...req.body.telemetry, provider_id: res.locals.provider_id } : null,
    timestamp: req.body.timestamp,
    trip_id: req.body.trip_id,
    recorded,
    telemetry_timestamp: undefined // added for diagnostic purposes
  }

  try {
    validateEvent(event)
  } catch (err) {
    logger.info(
      `Non-critical prototype Event ValidationError for ${providerName(provider_id)}. Error: ${JSON.stringify(err)}`
    )
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
      logger.info(`${name} post event took ${delta} ms`)
      fin()
    } else {
      fin()
    }
  }

  /* istanbul ignore next */
  async function fail(err: Error | Partial<{ message: string }>, event: Partial<VehicleEvent>): Promise<void> {
    const message = err.message || String(err)
    if (message.includes('duplicate')) {
      logger.info('duplicate event', { name, event })
      res.status(400).send({
        error: 'bad_param',
        error_description: 'An event with this device_id and timestamp has already been received'
      })
    } else if (message.includes('not found') || message.includes('unregistered')) {
      logger.info('event for unregistered', { name, event })
      res.status(400).send({
        error: 'unregistered',
        error_description: 'The specified device_id has not been registered'
      })
    } else {
      logger.error('post event fail:', { event, message })
      res.status(500).send(agencyServerError)
    }

    await stream.writeEventError({
      provider_id,
      data: event,
      recorded: now(),
      error_message: message
    })
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
    const failure = (await badEvent(device, event)) || (event.telemetry ? badTelemetry(event.telemetry) : null)
    // TODO unify with fail() above
    if (failure) {
      await stream.writeEventError({
        provider_id,
        data: event,
        recorded: now(),
        error_message: failure.error_description
      })
      logger.info('event failure', { name, failure, event })
      return res.status(400).send(failure)
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
    await fail(err, event)
  }
}

export const submitVehicleTelemetry = async (
  req: AgencyApiSubmitVehicleTelemetryRequest,
  res: AgencyApiSubmitVehicleTelemetryResponse
) => {
  const recorded = now()
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
  if (!data) {
    res.status(400).send({
      error: 'bad_param',
      error_description: 'Missing data from post-body'
    })
    return
  }

  const name = providerName(provider_id)

  try {
    const deviceIds: Set<UUID> = await (async () => {
      if (data.length === 1) {
        const [telemetry] = data

        if ('device_id' in telemetry) {
          const { device_id } = telemetry

          if (isUUID(device_id)) {
            const device = await db.readDevice(device_id, provider_id)

            // Map with only one entry
            return new Set<UUID>([device.device_id])
          }
        }
      }

      const deviceIdsWithProviderIds = await db.readDeviceIds(provider_id)

      // Turn array returned to a Set for fast lookups
      return new Set(deviceIdsWithProviderIds.map(({ device_id }) => device_id))
    })()

    const { valid, failures } = data.reduce<{
      valid: Telemetry[]
      failures: { telemetry: Telemetry; reason: string }[]
    }>(
      ({ valid, failures }, rawTelemetry) => {
        const unvalidatedTelemetry: Telemetry = {
          ...rawTelemetry,
          provider_id,
          recorded
        }

        try {
          const validatedTelemetry = validateTelemetryDomainModel(unvalidatedTelemetry)

          const { device_id } = validatedTelemetry

          if (!deviceIds.has(device_id))
            return {
              valid,
              failures: [...failures, { telemetry: rawTelemetry, reason: `device_id: ${device_id} not found` }]
            }

          return { valid: [...valid, validatedTelemetry], failures }
        } catch (error) {
          if (error instanceof ValidationError) {
            const parsedError = agencyValidationErrorParser(error)

            return {
              valid,
              failures: [...failures, { telemetry: unvalidatedTelemetry, reason: parsedError.error_description }]
            }
          }
        }

        return { valid, failures }
      },
      { valid: [], failures: [] }
    )

    if (valid.length) {
      const recorded_telemetry = await writeTelemetry(valid)

      const delta = Date.now() - start
      if (delta > 300) {
        logger.info('writeTelemetry', {
          name,
          validItems: valid.length,
          unique: recorded_telemetry.length,
          delta: `${delta} ms (${Math.round((1000 * valid.length) / delta)}/s)`
        })
      }
      if (recorded_telemetry.length) {
        res.status(200).send({
          success: valid.length,
          total: data.length,
          failures: failures.map(({ telemetry }) => telemetry)
        })
      } else {
        logger.info(`no unique telemetry in ${data.length} items for ${name}`)
        res.status(400).send({
          error: 'invalid_data',
          error_description: 'None of the provided data was valid',
          error_details: failures
        })
      }
    } else {
      const body = `${JSON.stringify(req.body).substring(0, 128)} ...`
      const fails = `${JSON.stringify(failures).substring(0, 128)} ...`
      logger.info(`no valid telemetry in ${data.length} items for ${name}`, { body, fails })
      res.status(400).send({
        error: 'invalid_data',
        error_description: 'None of the provided data was valid',
        error_details: failures
      })
    }
  } catch (err) {
    if (isError(err, NotFoundError))
      return res.status(400).send({
        error: 'unregistered',
        error_description: 'Some of the devices are unregistered',
        error_details: [data[0].device_id]
      })

    return res.status(500).send({ error: new ServerError() })
  }
}

/* Experimental Handler */
export const writeTripMetadata = async (
  req: AgencyApiPostTripMetadataRequest,
  res: AgencyApiPostTripMetadataResponse
) => {
  try {
    const { provider_id } = res.locals
    /* TODO Add better validation once trip metadata proposal is solidified */
    const tripMetadata = { ...validateTripMetadata({ ...req.body, provider_id }), recorded: Date.now() }
    await stream.writeTripMetadata(tripMetadata)

    return res.status(201).send(tripMetadata)
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).send({ error })
    return res.status(500).send({ error: new ServerError() })
  }
}
