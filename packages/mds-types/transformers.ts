import { UUID, Timestamp, VEHICLE_EVENT, Telemetry, VEHICLE_REASON } from './index'

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
  vehicle_state: VEHICLE_EVENT
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
    vehicle_state: event_type,
    event_types: event_type_reason ? [event_type_reason] : [],
    telemetry_timestamp,
    telemetry,
    trip_id,
    service_area_id,
    recorded
  }
}

function v1_0_0_to_v0_4_0_helper(event: VehicleEvent_v1_0_0, event_type: VEHICLE_REASON | null): VehicleEvent_v0_4_1 {
  return {
    device_id: event.device_id,
    provider_id: event.provider_id,
    timestamp: event.timestamp,
    timestamp_long: event.timestamp_long,
    delta: event.delta,
    event_type: event.vehicle_state,
    event_type_reason: event_type,
    telemetry_timestamp: event.telemetry_timestamp,
    trip_id: event.trip_id,
    service_area_id: event.service_area_id,
    recorded: event.recorded
  }
}

export function v1_0_0_to_v0_4_0(event: VehicleEvent_v1_0_0): VehicleEvent_v0_4_1[] {
  if (event.event_types.length > 0) {
    return event.event_types.map(event_type => {
      return v1_0_0_to_v0_4_0_helper(event, event_type)
    })
  }
  return [v1_0_0_to_v0_4_0_helper(event, null)]
}
