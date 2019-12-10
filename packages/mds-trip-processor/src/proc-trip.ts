import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import log from '@mds-core/mds-logger'
import { calcDistance, isUUID } from '@mds-core/mds-utils'

import { TripEvent, TripEntry, TripTelemetry, UUID, Timestamp } from '@mds-core/mds-types'
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
  provider_id: UUID,
  device_id: UUID,
  trip_id: UUID,
  events: TripEvent[],
  curTime: Timestamp
): Promise<boolean> {
  /*
    Add telemetry and meta data into database when a trip ends

    Examples:

        1) trip duration
        2) trip length
        3) SLA violations
        4) event binned telemetry

    We must compute these metrics here due to the potential of up to 24hr delay of telemetry data
  */

  // Validation steps
  if (events.length < 2) {
    log.info('NO TRIP END SEEN')
    return false
  }

  // Process anything where the last event timestamp is more than 24 hours old
  events.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
  const timeSLA = config.compliance_sla.max_telemetry_time
  const latestTime = events[events.length - 1].timestamp
  if (latestTime + timeSLA > curTime) {
    log.info('TRIPS ENDED LESS THAN 24HRS AGO')
    return false
  }

  // Calculate event binned trip telemetry data
  const tripMap = await cache.readTripsTelemetry(`${provider_id}:${device_id}`)
  if (tripMap) {
    // Get trip metadata
    const tripStartEvent = events[0]
    const tripEndEvent = events[events.length - 1]
    const baseTripData = {
      vehicle_type: tripStartEvent.vehicle_type,
      trip_id,
      device_id,
      provider_id,
      start_time: tripStartEvent.timestamp,
      end_time: tripEndEvent.timestamp,
      start_service_area_id: tripStartEvent.service_area_id,
      end_service_area_id: tripEndEvent.service_area_id
    }
    const tripTelemetry = tripMap[trip_id]
    const telemetry: TripTelemetry[][] = []
    if (tripTelemetry && tripTelemetry.length > 0) {
      for (let i = 0; i < events.length - 2; i++) {
        const start_time = events[i].timestamp
        const end_time = events[i + 1].timestamp
        // Exclude event telemetry points
        const tripSegment = tripTelemetry.filter(
          telemetry_point => telemetry_point.timestamp > start_time && telemetry_point.timestamp < end_time
        )
        tripSegment.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
        telemetry.push(tripSegment)
      }
    } else {
      throw new Error('TRIP TELEMETRY NOT FOUND')
    }

    // Calculate trip metrics
    const duration = tripEndEvent.timestamp - tripStartEvent.timestamp
    const distMeasure = tripStartEvent.gps ? calcDistance(telemetry, tripStartEvent.gps) : null
    const distance = distMeasure ? distMeasure.distance : null
    const points = distMeasure ? distMeasure.points : []
    const violationArray = points.filter(dist => {
      return dist > config.compliance_sla.max_telemetry_distance
    })
    const violation_count = violationArray.length
    const max_violation_dist = violation_count ? Math.min(...violationArray) : null
    const min_violation_dist = violation_count ? Math.max(...violationArray) : null
    const avg_violation_dist = violation_count ? violationArray.reduce((a, b) => a + b) / violationArray.length : null

    const tripData: TripEntry = {
      ...baseTripData,
      duration,
      distance,
      violation_count,
      max_violation_dist,
      min_violation_dist,
      avg_violation_dist,
      events,
      telemetry
    }

    await db.insertTrips(tripData)
    // Delete all processed telemetry data and update cache
    delete tripMap[trip_id]
    await cache.writeTripsTelemetry(`${provider_id}:${device_id}`, tripMap)
    return true
  }
  await log.warn('NO TELEMETRY FOUND FOR TRIP')
  return false
}

export async function tripAggregator(): Promise<boolean> {
  log.info('trigger YEAH BOI')
  const curTime = new Date().getTime()
  const tripsMap = await cache.readAllTripsEvents()
  if (!tripsMap) {
    log.info('NO TRIP EVENTS FOUND')
    return false
  }
  await Promise.all(
    Object.keys(tripsMap).map(async vehicleID => {
      const [provider_id, device_id] = vehicleID.split(':')
      const tripsEvents = tripsMap[vehicleID]
      const unprocessedTripsEvents = tripsEvents

      const results = await Promise.all(
        Object.keys(tripsEvents).map(async tripID => {
          try {
            return processTrip(provider_id, device_id, tripID, tripsEvents[tripID], curTime)
          } catch (err) {
            return log.error(err)
          }
        })
      )

      results.map(tripID => {
        if (isUUID(tripID) && unprocessedTripsEvents[tripID]) delete unprocessedTripsEvents[tripID]
      })

      // Update or clear cache
      if (Object.keys(unprocessedTripsEvents).length) return cache.writeTripsEvents(vehicleID, unprocessedTripsEvents)
      return cache.deleteTripsEvents(vehicleID)
    })
  )
  return true
}
