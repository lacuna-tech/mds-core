import { UUID, Timestamp, VEHICLE_EVENT, Telemetry, VEHICLE_REASON } from '../index'

export interface VehicleEvent_v0_4_1 {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  timestamp_long?: string | null
  delta?: Timestamp | null
  event_type: VEHICLE_EVENT
  event_type_reason?: VEHICLE_REASON | null
  telemetry_timestamp?: Timestamp | null
  telemetry?: Telemetry | null
  trip_id?: UUID | null
  service_area_id?: UUID | null
  recorded: Timestamp
}

export interface VehicleEvent_v1_0_0 {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  timestamp_long?: string | null
  delta?: Timestamp | null
  vehicle_state: VEHICLE_EVENT[]
  event_types: VEHICLE_REASON[]
  telemetry_timestamp?: Timestamp | null
  telemetry?: Telemetry | null
  trip_id?: UUID | null
  service_area_id?: UUID | null
  recorded: Timestamp
}

export function v0_4_1_to_v1_0_0(event: VehicleEvent_v0_4_1): VehicleEvent_v1_0_0 {
  const {
    device_id,
    provider_id,
    timestamp,
    timestamp_long = null,
    delta = null,
    event_type,
    event_type_reason = null,
    telemetry_timestamp = null,
    telemetry = null,
    trip_id = null,
    service_area_id = null,
    recorded
  } = event
  return {
    device_id,
    provider_id,
    timestamp,
    timestamp_long,
    delta,
    vehicle_state: [event_type],
    event_types: [event_type_reason],
    telemetry_timestamp,
    telemetry,
    trip_id,
    service_area_id,
    recorded
  }
}
