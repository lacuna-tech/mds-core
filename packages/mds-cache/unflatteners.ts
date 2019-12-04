import {
  VEHICLE_TYPE,
  VEHICLE_EVENT,
  VEHICLE_STATUS,
  VEHICLE_REASON,
  Device,
  StateEntry,
  TripsEvents,
  TripsTelemetry,
  Telemetry,
  VehicleEvent,
  Timestamp,
  UUID
} from '@mds-core/mds-types'
import {
  isStringifiedTelemetry,
  isStringifiedEventWithTelemetry,
  isStringifiedCacheReadDeviceResult
} from '@mds-core/mds-schema-validators'

import log from '@mds-core/mds-logger'
import {
  StringifiedEvent,
  StringifiedTelemetry,
  StringifiedCacheReadDeviceResult,
  CachedItem,
  StringifiedStateEntry,
  StringifiedAllDeviceStates,
  StringifiedTripsEvents,
  StringifiedTripsTelemetry,
  StringifiedAllTripsEvents
} from './types'

function parseDeviceState(deviceState: StringifiedStateEntry): StateEntry {
  try {
    return {
      vehicle_type: deviceState.vehicle_type as VEHICLE_TYPE,
      type: deviceState.type,
      timestamp: Number(deviceState.timestamp) as Timestamp,
      device_id: deviceState.device_id,
      provider_id: deviceState.provider_id,
      recorded: Number(deviceState.recorded) as Timestamp,
      annotation_version: Number(deviceState.annotation_version),
      annotation: deviceState.annotation
        ? { in_bound: JSON.parse(deviceState.annotation.in_bound), areas: deviceState.annotation.areas }
        : null,
      gps: deviceState.gps
        ? {
            lat: Number(deviceState.gps.lat),
            lng: Number(deviceState.gps.lng),
            altitude: deviceState.gps.altitude ? Number(deviceState.gps.altitude) : null,
            heading: deviceState.gps.heading ? Number(deviceState.gps.heading) : null,
            speed: deviceState.gps.speed ? Number(deviceState.gps.speed) : null,
            accuracy: deviceState.gps.accuracy ? Number(deviceState.gps.accuracy) : null
          }
        : null,
      service_area_id: deviceState.service_area_id ? (deviceState.service_area_id as UUID) : null,
      charge: deviceState.charge ? Number(deviceState.charge) : null,
      state: deviceState.state ? (deviceState.state as VEHICLE_STATUS) : null,
      event_type: deviceState.event_type ? (deviceState.event_type as VEHICLE_EVENT) : null,
      event_type_reason: deviceState.event_type_reason ? (deviceState.event_type_reason as VEHICLE_REASON) : null,
      trip_id: deviceState.trip_id ? (deviceState.trip_id as UUID) : null
    }
  } catch (err) {
    throw new Error(`unable to parse deviceState: ${deviceState}`)
  }
}

function parseAllDeviceStates(allDeviceStates: StringifiedAllDeviceStates): { [vehicle_id: string]: StateEntry } {
  try {
    const devices: { [vehicle_id: string]: StateEntry } = {}
    /* eslint-disable-next-line guard-for-in */
    for (const vehicle_id in allDeviceStates) {
      devices[vehicle_id] = parseDeviceState(allDeviceStates[vehicle_id])
    }
    return devices
  } catch (err) {
    throw new Error(`unable to parse allDeviceStates`)
  }
}

async function parseTripsEvents(tripsEventsStr: StringifiedTripsEvents): Promise<TripsEvents> {
  try {
    const trips: TripsEvents = {}
    // Need some help here
    const tripsEvents = JSON.parse(String(tripsEventsStr))
    /* eslint-reason FIXME use map() */
    /* eslint-disable-next-line guard-for-in */
    for (const trip_id in tripsEvents) {
      for (let i = 0; i < tripsEvents[trip_id].length; i++) {
        trips[trip_id] = []
        trips[trip_id].push({
          vehicle_type: tripsEvents[trip_id][i].vehicle_type as VEHICLE_TYPE,
          timestamp: Number(tripsEvents[trip_id][i].timestamp) as Timestamp,
          event_type: tripsEvents[trip_id][i].event_type as VEHICLE_EVENT,
          event_type_reason: tripsEvents[trip_id][i].event_type_reason
            ? (tripsEvents[trip_id][i].event_type_reason as VEHICLE_REASON)
            : null,
          annotation_version: Number(tripsEvents[trip_id][i].annotation_version),
          annotation: {
            in_bound: JSON.parse(tripsEvents[trip_id][i].annotation.in_bound),
            areas: tripsEvents[trip_id][i].annotation.areas
          },
          gps: {
            lat: Number(tripsEvents[trip_id][i].gps.lat),
            lng: Number(tripsEvents[trip_id][i].gps.lng),
            altitude: tripsEvents[trip_id][i].gps.altitude ? Number(tripsEvents[trip_id][i].gps.altitude) : null,
            heading: tripsEvents[trip_id][i].gps.heading ? Number(tripsEvents[trip_id][i].gps.heading) : null,
            speed: tripsEvents[trip_id][i].gps.speed ? Number(tripsEvents[trip_id][i].gps.speed) : null,
            accuracy: tripsEvents[trip_id][i].gps.accuracy ? Number(tripsEvents[trip_id][i].gps.accuracy) : null
          },
          service_area_id: tripsEvents[trip_id][i].service_area_id
            ? (tripsEvents[trip_id][i].service_area_id as UUID)
            : null
        })
      }
    }
    return trips
  } catch (err) {
    await log.error(err)
    throw new Error(`unable to parse tripsEvents: ${tripsEventsStr}`)
  }
}

async function parseTripsTelemetry(tripsTelemetryStr: StringifiedTripsTelemetry): Promise<TripsTelemetry> {
  try {
    const trips: TripsTelemetry = {}
    const tripsTelemetry = JSON.parse(String(tripsTelemetryStr))
    /* eslint-reason FIXME use map() */
    /* eslint-disable-next-line guard-for-in */
    for (const trip_id in tripsTelemetry) {
      for (let i = 0; i < tripsTelemetry[trip_id].length; i++) {
        trips[trip_id] = []
        trips[trip_id].push({
          timestamp: Number(tripsTelemetry[trip_id][i].timestamp) as Timestamp,
          latitude: Number(tripsTelemetry[trip_id][i].latitude),
          longitude: Number(tripsTelemetry[trip_id][i].longitude),
          annotation_version: Number(tripsTelemetry[trip_id][i].annotation_version),
          annotation: {
            in_bound: JSON.parse(tripsTelemetry[trip_id][i].annotation.in_bound),
            areas: tripsTelemetry[trip_id][i].annotation.areas
          },
          service_area_id: tripsTelemetry[trip_id][i].service_area_id
            ? (tripsTelemetry[trip_id][i].service_area_id as UUID)
            : null
        })
      }
    }
    return trips
  } catch (err) {
    await log.error(err)
    throw new Error(`unable to parse tripsTelemetry: ${tripsTelemetryStr}`)
  }
}

async function parseAllTripsEvents(
  allTripsEvents: StringifiedAllTripsEvents
): Promise<{
  [vehicle_id: string]: TripsEvents
}> {
  try {
    const allTrips: { [vehicle_id: string]: TripsEvents } = {}

    /* eslint-reason FIXME use map() */
    /* eslint-disable-next-line guard-for-in */
    for (const vehicle_id in allTripsEvents) {
      /* eslint-reason FIXME use Promise.all() */
      /* eslint-disable-next-line no-await-in-loop */
      allTrips[vehicle_id] = await parseTripsEvents(allTripsEvents[vehicle_id])
    }
    return allTrips
  } catch (err) {
    throw new Error(`unable to parse allTripsEvents`)
  }
}

function parseTelemetry(telemetry: StringifiedTelemetry): Telemetry {
  try {
    return {
      charge: telemetry.charge ? Number(telemetry.charge) : null,
      device_id: telemetry.device_id,
      provider_id: telemetry.provider_id,
      gps: {
        lat: Number(telemetry.gps.lat),
        lng: Number(telemetry.gps.lng),
        speed: telemetry.gps.speed ? Number(telemetry.gps.speed) : null,
        satellites: telemetry.gps.satellites ? Number(telemetry.gps.satellites) : null,
        heading: telemetry.gps.heading ? Number(telemetry.gps.heading) : null,
        hdop: telemetry.gps.hdop ? Number(telemetry.gps.hdop) : null,
        altitude: telemetry.gps.altitude ? Number(telemetry.gps.altitude) : null
      },
      recorded: Number(telemetry.recorded),
      timestamp: Number(telemetry.timestamp)
    }
  } catch (err) {
    throw new Error(`unable to parse telemetry: ${telemetry}`)
  }
}

function parseEvent(
  event: StringifiedEvent & {
    telemetry?: StringifiedTelemetry
  }
): VehicleEvent {
  if (event) {
    return {
      device_id: event.device_id,
      provider_id: event.provider_id,
      timestamp: Number(event.timestamp),
      timestamp_long: event.timestamp_long ? event.timestamp_long : null,
      delta: event.delta ? Number(event.delta) : null,
      event_type: event.event_type as VEHICLE_EVENT,
      telemetry_timestamp: event.telemetry_timestamp ? Number(event.telemetry_timestamp) : null,
      telemetry: event.telemetry ? parseTelemetry(event.telemetry) : null,
      trip_id: event.trip_id ? event.trip_id : null,
      service_area_id: event.service_area_id ? event.service_area_id : null,
      recorded: Number(event.recorded)
    }
  }
  return event
}

function parseDevice(device: StringifiedCacheReadDeviceResult): Device {
  if (device) {
    return {
      device_id: device.device_id,
      provider_id: device.provider_id,
      vehicle_id: device.vehicle_id,
      type: device.type as VEHICLE_TYPE,
      propulsion: device.propulsion,
      year: device.year ? Number(device.year) : null,
      mfgr: device.mfgr ? device.mfgr : null,
      model: device.model ? device.model : null,
      recorded: Number(device.recorded),
      status: device.status ? (device.status as VEHICLE_STATUS) : null
    }
  }
  return device
}

function parseCachedItem(item: CachedItem): Device | Telemetry | VehicleEvent {
  if (isStringifiedTelemetry(item)) {
    return parseTelemetry(item)
  }
  if (isStringifiedEventWithTelemetry(item)) {
    return parseEvent(item)
  }
  if (isStringifiedCacheReadDeviceResult(item)) {
    return parseDevice(item)
  }

  throw new Error(`unable to parse ${JSON.stringify(item)}`)
}

export {
  parseDeviceState,
  parseAllDeviceStates,
  parseTripsEvents,
  parseTripsTelemetry,
  parseAllTripsEvents,
  parseEvent,
  parseTelemetry,
  parseDevice,
  parseCachedItem
}
