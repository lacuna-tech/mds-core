import { Timestamp, Nullable, Telemetry } from '@mds-core/mds-types'

export interface FlattenedTelemetry {
  telemetry_recorded: Timestamp
  telemetry_timestamp: Timestamp
  telemetry_lat: number
  telemetry_lng: number
  telemetry_altitude: Nullable<number>
  telemetry_heading: Nullable<number>
  telemetry_speed: Nullable<number>
  telemetry_accuracy: Nullable<number>
  telemetry_charge: Nullable<number>
}

export const flattenTelemetry: (
  telemetry: Pick<Telemetry & { recorded: Timestamp }, 'recorded' | 'timestamp' | 'gps' | 'charge'>
) => FlattenedTelemetry = telemetry => {
  const { timestamp, recorded, gps } = telemetry
  return {
    telemetry_recorded: recorded,
    telemetry_timestamp: timestamp,
    telemetry_lat: gps.lat,
    telemetry_lng: gps.lng,
    telemetry_altitude: gps.altitude ?? null,
    telemetry_heading: gps.heading ?? null,
    telemetry_speed: gps.speed ?? null,
    telemetry_accuracy: gps.accuracy ?? null,
    telemetry_charge: telemetry.charge ?? null
  }
}
