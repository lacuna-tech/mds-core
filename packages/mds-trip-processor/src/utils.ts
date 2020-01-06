import { TripEvent, TripsTelemetry, TripTelemetry, Timestamp, UUID } from '@mds-core/mds-types'
import log from '@mds-core/mds-logger'

export const eventValidation = (events: TripEvent[], curTime: Timestamp, timeSLA: number): boolean => {
  if (events.length < 2) {
    log.info('NO TRIP_END EVENT SEEN')
    return false
  }
  // Process anything where the last event timestamp is more than 24 hours old
  const latestTime = events[events.length - 1].timestamp
  if (latestTime + timeSLA > curTime) {
    log.info('TRIPS ENDED LESS THAN 24HRS AGO')
    return false
  }
  return true
}

export const createTelemetryMap = (
  events: TripEvent[],
  tripMap: TripsTelemetry,
  trip_id: UUID
): { [event: number]: TripTelemetry[] } => {
  const tripTelemetry = tripMap[trip_id]
  const telemetry: { [event: number]: TripTelemetry[] } = {}
  if (tripTelemetry && tripTelemetry.length > 0) {
    for (let i = 0; i < events.length - 1; i++) {
      const startTime = events[i].timestamp
      const endTime = events[i + 1].timestamp
      // Bin telemetry by events
      const tripSegment = tripTelemetry.filter(
        telemetryPoint => telemetryPoint.timestamp >= startTime && telemetryPoint.timestamp < endTime
      )
      tripSegment.sort((a, b) => a.timestamp - b.timestamp)
      telemetry[startTime] = tripSegment
    }
    const lastEvent = tripTelemetry.filter(
      telemetryPoint => telemetryPoint.timestamp === events[events.length - 1].timestamp
    )
    telemetry[events[events.length - 1].timestamp] = lastEvent
  } else {
    throw new Error('TRIP TELEMETRY NOT FOUND')
  }
  return telemetry
}
