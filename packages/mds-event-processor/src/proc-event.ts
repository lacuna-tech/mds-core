import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import log from '@mds-core/mds-logger'

import {
  InboundEvent,
  InboundTelemetry,
  StateEntry,
  TripEvent,
  TripTelemetry,
  EVENT_STATUS_MAP,
  VEHICLE_TYPE,
  UUID,
  Timestamp
} from '@mds-core/mds-types'
import { getAnnotationData, getAnnotationVersion } from './annotation'

/*
    Event processor that runs inside a Kubernetes pod.
    Streams cloudevents from mds agency and process them in multiple ways:

        1) quality checks
        2) status changes
        3) trip identification

    Processed events/telemetry are added to various caches keyed as follows:

        1) device:state (latest event/telemetry for a device)
        2) trip:events (events linked to trips of a device)
        3) device:ID:trips (all telemetry linked to all trips of a device)
            - ID is the combination 'provider_id:device_id'

    A Postgres table is also populated to store historical states:

        REPORTS_DEVICE_STATES:
          PRIMARY KEY = (provider_id, device_id, timestamp, type)
          VALUES = deviceState
*/

async function getTripId(deviceState: StateEntry): Promise<string | null> {
  /*
    Return trip_id for telemetery entry by associating timestamps
  */
  const { provider_id, device_id, timestamp } = deviceState
  const tripsEvents = await cache.readTripsEvents(`${provider_id}:${device_id}`)
  if (!tripsEvents) {
    await log.warn('NO PRIOR TRIP EVENTS FOUND')
    return null
  }
  const sortedStartEvents = Object.entries(tripsEvents).sort((a, b) =>
    b[1].filter(tripEvent => {
      return tripEvent.event_type === 'trip_start' || tripEvent.event_type === 'trip_enter'
    })[0].timestamp >
    a[1].filter(tripEvent => {
      return tripEvent.event_type === 'trip_start' || tripEvent.event_type === 'trip_enter'
    })[0].timestamp
      ? 1
      : -1
  )
  const match = sortedStartEvents.find(x => {
    return timestamp >= x[1][0].timestamp
  })
  return match ? match[0] : null
}

async function processTripTelemetry(deviceState: StateEntry): Promise<boolean> {
  /*
    Add trip related telemetry to cache (trips:telemetry):

      Key: 'provider_id:device_id'
      Value: hash map of tripTelemetry keyed by trip_id

  */
  const {
    type,
    timestamp,
    annotation_version,
    annotation,
    gps,
    service_area_id,
    provider_id,
    device_id,
    trip_id
  } = deviceState

  const lng = gps ? gps.lng : null
  const lat = gps ? gps.lat : null
  const tripTelemetry: TripTelemetry = {
    timestamp,
    latitude: lat,
    longitude: lng,
    annotation_version,
    annotation,
    service_area_id
  }

  // Check if associated to an event or telemetry post
  const tripId = type === 'mds.telemetry' ? await getTripId(deviceState) : trip_id
  if (tripId) {
    const tripsCache = await cache.readTripsTelemetry(`${provider_id}:${device_id}`)
    const trips = tripsCache || {}
    if (!trips[tripId]) {
      trips[tripId] = []
    }
    trips[tripId].push(tripTelemetry)
    await cache.writeTripsTelemetry(`${provider_id}:${device_id}`, trips)
    return true
  }
  return false
}

async function processTripEvent(deviceState: StateEntry): Promise<boolean> {
  /*
    Add vehicle events of a trip to cache (trips:events):

      Key: 'provider_id:device_id'
      Value: hash map of tripEvents keyed by trip_id

  */
  const {
    vehicle_type,
    timestamp,
    event_type,
    event_type_reason,
    annotation_version,
    annotation,
    gps,
    service_area_id,
    trip_id,
    provider_id,
    device_id
  } = deviceState

  const tripEvent: TripEvent = {
    vehicle_type,
    timestamp,
    event_type,
    event_type_reason,
    annotation_version,
    annotation,
    gps,
    service_area_id
  }

  // Either append to existing trip or create new entry
  if (trip_id) {
    const tripsCache = await cache.readTripsEvents(`${provider_id}:${device_id}`)
    const trips = tripsCache || {}
    if (!trips[trip_id]) {
      trips[trip_id] = []
    }
    trips[trip_id].push(tripEvent)
    await cache.writeTripsEvents(`${provider_id}:${device_id}`, trips)
    await processTripTelemetry(deviceState)
    return true
  }
  return false
}

export async function eventHandler(type: string, data: InboundEvent & InboundTelemetry): Promise<void> {
  const { timestamp, device_id, provider_id, recorded } = data
  const lastState = await cache.readDeviceState(`${provider_id}:${device_id}`)
  // Construct state
  const baseDeviceState: {
    vehicle_type: VEHICLE_TYPE
    type: string
    timestamp: Timestamp
    device_id: UUID
    provider_id: UUID
    recorded: Timestamp
    annotation_version: number
  } = {
    vehicle_type: await cache.getVehicleType(device_id),
    type,
    timestamp,
    device_id,
    provider_id,
    recorded,
    annotation_version: getAnnotationVersion()
  }

  switch (baseDeviceState.type) {
    case 'mds.event': {
      const { event_type, telemetry, event_type_reason, trip_id, service_area_id } = data
      const gps = telemetry ? telemetry.gps : null
      const charge = telemetry ? telemetry.charge : null
      const annotation = gps ? getAnnotationData(gps) : null
      const deviceState: StateEntry = {
        ...baseDeviceState,
        annotation,
        gps,
        service_area_id,
        charge,
        state: EVENT_STATUS_MAP[event_type],
        event_type,
        event_type_reason,
        trip_id
      }
      // Take necessary steps on event trasitions
      switch (data.event_type) {
        case 'trip_start': {
          await processTripEvent(deviceState)
          break
        }
        case 'trip_enter': {
          await processTripEvent(deviceState)
          break
        }
        case 'trip_leave': {
          await processTripEvent(deviceState)
          break
        }
        case 'trip_end': {
          await processTripEvent(deviceState)
          break
        }
        default: {
          log.info('Not a trip transition state')
        }
      }
      // Only update cache (device:state) with most recent event
      if (!lastState || lastState.timestamp < deviceState.timestamp) {
        await cache.writeDeviceState(`${provider_id}:${device_id}`, deviceState)
      }
      await db.insertDeviceStates(deviceState)
      return
    }

    case 'mds.telemetry': {
      const { gps, charge } = data
      const annotation = getAnnotationData(gps)
      const deviceState: StateEntry = {
        ...baseDeviceState,
        annotation,
        gps,
        charge,
        service_area_id: null,
        state: null,
        event_type: null,
        event_type_reason: null,
        trip_id: null
      }
      await processTripTelemetry(deviceState)
      await db.insertDeviceStates(deviceState)
      return
    }

    default: {
      throw new Error('Not a valid cloudevent type')
    }
  }
}
