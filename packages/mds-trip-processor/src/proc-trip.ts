import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import log from '@mds-core/mds-logger'
import { calcDistance } from '@mds-core/mds-utils'

import { TripEvent, TripEntry, TripTelemetry } from '@mds-core/mds-types'
import config from './config'

/*
    Trip processor that runs inside a Kubernetes pod, activated via cron job.
    Aggregates event/telemety data into binned trips at a set interval. As trips
    are processed caches are cleaned.

    Processed trips are added to a postgres table:

        REPORTS_DEVICE_TRIPS:
          PRIMARY KEY = (provider_id, device_id, trip_id)
          VALUES = trip_data
*/

async function processTrip(
  provider_id: string,
  device_id: string,
  trip_id: string,
  tripEvents: TripEvent[],
  curTime: number
): Promise<boolean> {
  /*
    Add telemetry and meta data into database when a trip ends

    Examples:

        1) trip duration
        2) trip length

    We must compute these metrics here due to the potential of up to 24hr delay of telemetry data
  */

  // Validation steps
  // TODO: make checks more robust
  if (tripEvents.length < 2) {
    log.info('No trip end seen yet')
    return false
  }

  // Process anything where the last event timestamp is more than 24 hours old
  tripEvents.sort((a: { timestamp: number }, b: { timestamp: number }) => {
    return a.timestamp - b.timestamp
  })
  // const timeSLA = config.compliance_sla.max_telemetry_time
  // const latestTime = tripEvents[tripEvents.length - 1].timestamp
  // if (latestTime + timeSLA > curTime) {
  //  log.info('trips ended less than 24hrs ago')
  //  return false
  // }

  // FIXME Remove this line when above code is un-commented
  log.info(config, curTime)

  // Get trip metadata
  const tripStartEvent = tripEvents[0]
  const tripEndEvent = tripEvents[tripEvents.length - 1]
  const baseTripData = {
    vehicle_type: tripStartEvent.vehicle_type,
    trip_id,
    device_id,
    provider_id,
    start_time: tripStartEvent.timestamp,
    end_time: tripEndEvent.timestamp,
    start_service_area_id: tripStartEvent.service_area_id,
    end_service_area_id: tripEndEvent.service_area_id
  } as TripEntry

  // Get trip telemetry data
  const tripMap = await cache.readTripsTelemetry(`${provider_id}:${device_id}`)
  if (!tripMap) {
    log.info('NO TELEMETRY FOUND FOR TRIP')
    return false
  }
  const tripTelemetry = tripMap[trip_id]
  const telemetry: TripTelemetry[][] = []
  // Separate telemetry by trip events
  if (tripTelemetry && tripTelemetry.length > 0) {
    for (let i = 0; i < tripEvents.length - 1; i++) {
      const start_time = tripEvents[i].timestamp
      const end_time = i !== tripEvents.length - 1 ? tripEvents[i + 1].timestamp : null
      const tripSegment = tripTelemetry.filter(
        (telemetry_point: { timestamp: number }) =>
          telemetry_point.timestamp >= start_time && (end_time ? telemetry_point.timestamp <= end_time : true)
      ) as TripTelemetry[]
      tripSegment.sort((a: { timestamp: number }, b: { timestamp: number }) => {
        return a.timestamp - b.timestamp
      })
      telemetry.push(tripSegment)
    }
  } else {
    await log.warn('No telemtry found')
  }

  // Calculate trip metrics
  // We must calculate with trip since telemetry is delayed by up to 24 hrs
  const total_time = tripEndEvent.timestamp - tripStartEvent.timestamp
  const duration = total_time
  const distMeasure = calcDistance(telemetry, tripStartEvent.gps)
  const distance = distMeasure.totalDist
  const distArray = distMeasure.points
  const violation_count = distMeasure.points.length
  const max_violation_dist = Math.min(...distArray)
  const min_violoation_dist = Math.max(...distArray)
  const avg_violation_dist =
    distArray.length > 0 ? distArray.reduce((a: number, b: number) => a + b) / distArray.length : null

  const tripData = {
    ...baseTripData,
    duration,
    distance,
    violation_count,
    max_violation_dist,
    min_violoation_dist,
    avg_violation_dist,
    telemetry
  } as TripEntry

  log.info('INSERT')
  await db.insertTrips(tripData)

  // Delete all processed telemetry data and update cache
  log.info('DELETE')
  delete tripMap[trip_id]
  await cache.writeTripsTelemetry(`${provider_id}:${device_id}`, tripMap)
  return true
}

export async function tripAggregator() {
  const curTime = new Date().getTime()
  const tripsMap = await cache.readAllTripsEvents()
  console.log('triggered')
  /* eslint-reason FIXME use map() */
  /* eslint-disable-next-line guard-for-in */
  for (const vehicleID in tripsMap) {
    const [provider_id, device_id] = vehicleID.split(':')
    const trips = tripsMap[vehicleID]
    const unprocessedTrips = trips

    /* eslint-reason FIXME use map() */
    /* eslint-disable-next-line guard-for-in */
    for (const trip_id in trips) {
      /* eslint-reason FIXME use Promise.all() */
      /* eslint-disable-next-line no-await-in-loop */
      const tripProcessed = await processTrip(provider_id, device_id, trip_id, trips[trip_id], curTime)
      if (tripProcessed) {
        log.info('TRIP PROCESSED')
        delete unprocessedTrips[trip_id]
      }
    }
    // Update or clear cache
    if (Object.keys(unprocessedTrips).length) {
      log.info('PROCESSED SOME TRIPS')
      /* eslint-reason FIXME use Promise.all() */
      /* eslint-disable-next-line no-await-in-loop */
      await cache.writeTripsEvents(vehicleID, unprocessedTrips)
    } else {
      log.info('PROCESSED ALL TRIPS')
      /* eslint-reason FIXME use Promise.all() */
      /* eslint-disable-next-line no-await-in-loop */
      await cache.deleteTripsEvents(vehicleID)
    }
  }
}
