import express from 'express'
import { Query } from 'express-serve-static-core'

import { isUUID, isPct, isTimestamp, isFloat, isInsideBoundingBox, areThereCommonElements } from '@mds-core/mds-utils'
import stream from '@mds-core/mds-stream'
import {
  UUID,
  Device,
  VehicleEvent,
  Telemetry,
  ErrorObject,
  isEnum,
  VEHICLE_EVENTS,
  VEHICLE_TYPES,
  VEHICLE_STATES,
  PROPULSION_TYPES,
  BoundingBox,
  VEHICLE_STATE
} from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import logger from '@mds-core/mds-logger'
import cache from '@mds-core/mds-agency-cache'
import { isArray } from 'util'
import { VehiclePayload, TelemetryResult, CompositeVehicle, PaginatedVehiclesList } from './types'

export function badDevice(device: Device): { error: string; error_description: string } | null {
  if (!device.device_id) {
    return {
      error: 'missing_param',
      error_description: 'missing device_id'
    }
  }
  if (!isUUID(device.device_id)) {
    return {
      error: 'bad_param',
      error_description: `device_id ${device.device_id} is not a UUID`
    }
  }
  // propulsion is a list
  if (!Array.isArray(device.propulsion_types)) {
    return {
      error: 'missing_param',
      error_description: 'missing propulsion types'
    }
  }
  for (const prop of device.propulsion_types) {
    if (!isEnum(PROPULSION_TYPES, prop)) {
      return {
        error: 'bad_param',
        error_description: `invalid propulsion type ${prop}`
      }
    }
  }
  // if (device.year === undefined) {
  //     return {
  //         error: 'missing_param',
  //         error_description: 'missing integer field "year"'
  //     }
  // }
  if (device.year !== null && device.year !== undefined) {
    if (!Number.isInteger(device.year)) {
      return {
        error: 'bad_param',
        error_description: `invalid device year ${device.year} is not an integer`
      }
    }
    if (device.year < 1980 || device.year > 2020) {
      return {
        error: 'bad_param',
        error_description: `invalid device year ${device.year} is out of range`
      }
    }
  }
  if (device.vehicle_type === undefined) {
    return {
      error: 'missing_param',
      error_description: 'missing enum field "type"'
    }
  }
  if (!isEnum(VEHICLE_TYPES, device.vehicle_type)) {
    return {
      error: 'bad_param',
      error_description: `invalid device type ${device.vehicle_type}`
    }
  }
  // if (device.mfgr === undefined) {
  //     return {
  //         error: 'missing_param',
  //         error_description: 'missing string field "mfgr"'
  //     }
  // }
  // if (device.model === undefined) {
  //     return {
  //         error: 'missing_param',
  //         error_description: 'missing string field "model"'
  //     }
  // }
  return null
}

export async function getVehicles(
  skip: number,
  take: number,
  url: string,
  reqQuery: Query,
  provider_id?: string,
  bbox?: BoundingBox
): Promise<PaginatedVehiclesList> {
  function fmt(query: { skip: number; take: number }): string {
    const flat: { [key: string]: number } = { ...reqQuery, ...query }
    let s = `${url}?`
    s += Object.keys(flat)
      .map(key => `${key}=${flat[key]}`)
      .join('&')
    return s
  }

  const rows = await db.readDeviceIds(provider_id)
  const total = rows.length
  logger.info(`read ${total} deviceIds in /vehicles`)

  const events = await cache.readEvents(rows.map(record => record.device_id))
  const eventMap: { [s: string]: VehicleEvent } = {}
  events.map(event => {
    if (event) {
      eventMap[event.device_id] = event
    }
  })

  const deviceIdSuperset = bbox
    ? rows.filter(record => {
        return eventMap[record.device_id] ? isInsideBoundingBox(eventMap[record.device_id].telemetry, bbox) : true
      })
    : rows

  const deviceIdSubset = deviceIdSuperset.slice(skip, skip + take).map(record => record.device_id)
  const devices = (await db.readDeviceList(deviceIdSubset)).reduce((acc: Device[], device: Device) => {
    if (!device) {
      throw new Error('device in DB but not in cache')
    }
    const event = eventMap[device.device_id]
    const state: VEHICLE_STATE = event ? event.vehicle_state : 'removed'
    const telemetry = event ? event.telemetry : null
    const updated = event ? event.timestamp : null
    return [...acc, { ...device, state, telemetry, updated }]
  }, [])

  const noNext = skip + take >= deviceIdSuperset.length
  const noPrev = skip === 0 || skip > deviceIdSuperset.length
  const lastSkip = take * Math.floor(deviceIdSuperset.length / take)

  return {
    total,
    links: {
      first: fmt({
        skip: 0,
        take
      }),
      last: fmt({
        skip: lastSkip,
        take
      }),
      prev: noPrev
        ? null
        : fmt({
            skip: skip - take,
            take
          }),
      next: noNext
        ? null
        : fmt({
            skip: skip + take,
            take
          })
    },
    vehicles: devices
  }
}

const usBounds = {
  latMax: 49.45,
  latMin: 24.74,
  lonMax: -66.94,
  lonMin: -124.79
}

export function badTelemetry(telemetry: Telemetry | null | undefined): ErrorObject | null {
  if (!telemetry) {
    return {
      error: 'missing_param',
      error_description: 'invalid missing telemetry'
    }
  }

  const { device_id, timestamp, gps, charge } = telemetry

  if (typeof gps !== 'object') {
    return {
      error: 'missing_param',
      error_description: 'invalid missing gps'
    }
  }

  const { altitude, accuracy, speed, satellites } = gps
  const { lat, lng } = gps

  // validate all parameters
  if (!isUUID(device_id)) {
    return {
      error: 'missing_param',
      error_description: 'no device_id included in telemetry'
    }
  }
  if (typeof lat !== 'number' || Number.isNaN(lat) || lat < usBounds.latMin || lat > usBounds.latMax) {
    return {
      error: 'bad_param',
      error_description: `invalid lat ${lat}`
    }
  }
  if (typeof lng !== 'number' || Number.isNaN(lng) || lng < usBounds.lonMin || lng > usBounds.lonMax) {
    return {
      error: 'bad_param',
      error_description: `invalid lng ${lng}`
    }
  }
  if (altitude !== undefined && !isFloat(altitude)) {
    return {
      error: 'bad_param',
      error_description: `invalid altitude ${altitude}`
    }
  }
  if (accuracy !== undefined && !isFloat(accuracy)) {
    return {
      error: 'bad_param',
      error_description: `invalid accuracy ${accuracy}`
    }
  }
  if (speed !== undefined && !isFloat(speed)) {
    return {
      error: 'bad_param',
      error_description: `invalid speed ${speed}`
    }
  }
  if (satellites !== undefined && satellites !== null && !Number.isInteger(satellites)) {
    return {
      error: 'bad_param',
      error_description: `invalid satellites ${satellites}`
    }
  }
  if (charge !== undefined && !isPct(charge)) {
    return {
      error: 'bad_param',
      error_description: `invalid charge ${charge}`
    }
  }
  if (!isTimestamp(timestamp)) {
    return {
      error: 'bad_param',
      error_description: `invalid timestamp ${timestamp} (note: should be in milliseconds)`
    }
  }
  return null
}

// TODO Joi
export async function badEvent(event: VehicleEvent) {
  if (event.timestamp === undefined) {
    return {
      error: 'missing_param',
      error_description: 'missing enum field "timestamp"'
    }
  }
  if (!isTimestamp(event.timestamp)) {
    return {
      error: 'bad_param',
      error_description: `invalid timestamp ${event.timestamp}`
    }
  }

  if (!event.event_types) {
    return {
      error: 'missing_param',
      error_description: 'missing enum field "event_type"'
    }
  }

  if (!Array.isArray(event.event_types)) {
    return { error: 'bad_param', error_description: `invalid event_types ${event.event_types}` }
  }

  if (event.event_types.length === 0) {
    return {
      error: 'bad_param',
      error_description: 'empty event_types array'
    }
  }

  for (const event_type of event.event_types) {
    if (!VEHICLE_EVENTS.includes(event_type))
      return { error: 'bad_param', error_description: `invalid event_type in event_types ${event_type}` }
  }

  if (!event.vehicle_state) {
    return { error: 'missing_param', error_description: 'missing enum field "vehicle_state"' }
  }

  if (!VEHICLE_STATES.includes(event.vehicle_state)) {
    return { error: 'bad_param', error_description: `invalid vehicle_state ${event.vehicle_state}` }
  }

  if (event.trip_id === '') {
    /* eslint-reason TODO remove eventually -- Lime is spraying empty-string values */
    /* eslint-disable-next-line no-param-reassign */
    event.trip_id = null
  }

  const { trip_id } = event
  if (trip_id !== null && trip_id !== undefined && !isUUID(event.trip_id)) {
    return {
      error: 'bad_param',
      error_description: `invalid trip_id ${event.trip_id} is not a UUID`
    }
  }

  function missingTripId(): ErrorObject | null {
    if (!trip_id) {
      return {
        error: 'missing_param',
        error_description: 'missing trip_id'
      }
    }
    return null
  }

  // event-specific checking goes last
  // TODO update events here
  if (
    areThereCommonElements(
      ['trip_start', 'trip_end', 'trip_enter_jurisdiction', 'trip_leave_jurisdiction'],
      event.event_types
    )
  )
    return badTelemetry(event.telemetry) || missingTripId()

  if (event.event_types.includes('provider_drop_off')) return badTelemetry(event.telemetry)

  return null // we good
}

export function lower(s: string): string {
  if (typeof s === 'string') {
    return s.toLowerCase()
  }
  return s
}

export async function writeTelemetry(telemetry: Telemetry | Telemetry[]) {
  const recorded_telemetry = await db.writeTelemetry(Array.isArray(telemetry) ? telemetry : [telemetry])
  try {
    await Promise.all([cache.writeTelemetry(recorded_telemetry), stream.writeTelemetry(recorded_telemetry)])
  } catch (err) {
    logger.warn(`Failed to write telemetry to cache/stream, ${err}`)
  }
  return recorded_telemetry
}

export async function refresh(device_id: UUID, provider_id: UUID): Promise<string> {
  // TODO all of this back and forth between cache and db is slow
  const device = await db.readDevice(device_id, provider_id)
  // logger.info('refresh device', device)
  await cache.writeDevice(device)
  try {
    const event = await db.readEvent(device_id)
    await cache.writeEvent(event)
  } catch (err) {
    logger.info('no events for', device_id, err)
  }
  try {
    await db.readTelemetry(device_id)
  } catch (err) {
    logger.info('no telemetry for', device_id, err)
  }
  return 'done'
}

/**
 * for some functions we will want to validate the :device_id param
 */
export async function validateDeviceId(req: express.Request, res: express.Response, next: Function) {
  const { device_id } = req.params

  /* istanbul ignore if This is never called with no device_id parameter */
  if (!device_id) {
    logger.warn('agency: missing device_id', req.originalUrl)
    res.status(400).send({
      error: 'missing_param',
      error_description: 'missing device_id'
    })
    return
  }
  if (device_id && !isUUID(device_id)) {
    logger.warn('agency: bogus device_id', device_id, req.originalUrl)
    res.status(400).send({
      error: 'bad_param',
      error_description: `invalid device_id ${device_id} is not a UUID`
    })
    return
  }
  next()
}

export function computeCompositeVehicleData(payload: VehiclePayload) {
  const { device, event, telemetry } = payload

  const composite: CompositeVehicle = {
    ...device
  }

  if (event) {
    composite.prev_events = event.event_types
    composite.updated = event.timestamp
    composite.state = event.vehicle_state
  } else {
    composite.state = 'removed'
    composite.prev_events = ['decommissioned']
  }
  if (telemetry) {
    if (telemetry.gps) {
      composite.gps = telemetry.gps
    }
  }
  return composite
}

const normalizeTelemetry = (telemetry: TelemetryResult) => {
  if (isArray(telemetry)) {
    return telemetry[0]
  }
  return telemetry
}

export async function readPayload(device_id: UUID): Promise<VehiclePayload> {
  const payload: VehiclePayload = {}
  try {
    payload.device = await db.readDevice(device_id)
  } catch (err) {
    logger.error(err)
  }
  try {
    payload.event = await cache.readEvent(device_id)
    if (payload.event) {
      if (payload.event.telemetry) {
        payload.telemetry = normalizeTelemetry(payload.event.telemetry)
      }
    }
  } catch (err) {
    logger.error(err)
  }
  return payload
}
