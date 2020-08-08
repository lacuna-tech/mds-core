import { VEHICLE_REASON_0_4_1, VehicleEvent_v0_4_1, VEHICLE_EVENT_0_4_1 } from '../@types'
import { VEHICLE_EVENT, VehicleEvent, VEHICLE_STATE } from '../../index'

type EVENT_TYPE_REASONS = VEHICLE_REASON_0_4_1 | 'no_event_type_reason'

export const FULL_STATE_MAPPING_0_4_1_to_1_0_0: {
  [P in VEHICLE_EVENT_0_4_1]: {
    [Q in EVENT_TYPE_REASONS]: {
      event_type: VEHICLE_EVENT
      vehicle_state: VEHICLE_STATE
    }
  }
} = {
  /* `agency_drop_off` included for the sake of completeness. No provider will ever submit such
   * an event type through the agency API.
   */
  agency_drop_off: { no_event_type_reason: { event_type: 'agency_drop_off', vehicle_state: 'available' } },
  agency_pick_up: { no_event_type_reason: { event_type: 'agency_pick_up', vehicle_state: 'removed' } },
  cancel_reservation: { no_event_type_reason: { event_type: 'reservation_cancel', vehicle_state: 'available' } },
  deregister: {
    decommissioned: { event_type: 'decommissioned', vehicle_state: 'removed' },
    missing: { event_type: 'missing', vehicle_state: 'removed' }
  },
  provider_pick_up: {
    rebalance: { event_type: 'rebalance_pick_up', vehicle_state: 'removed' },
    maintenance: { event_type: 'maintenance_pick_up', vehicle_state: 'removed' },
    charge: { event_type: 'maintenance_pick_up', vehicle_state: 'removed' },
    compliance: { event_type: 'compliance_pick_up', vehicle_state: 'removed' }
  },
  provider_drop_off: {
    no_event_type_reason: { event_type: 'provider_drop_off', vehicle_state: 'available' }
  },
  reserve: {
    no_event_type_reason: { event_type: 'reservation_start', vehicle_state: 'reserved' }
  },
  service_start: {
    no_event_type_reason: { event_type: 'on_hours', vehicle_state: 'available' }
  },
  service_end: {
    low_battery: { event_type: 'battery_low', vehicle_state: 'non_operational' },
    maintenance: { event_type: 'maintenance', vehicle_state: 'non_operational' },
    compliance: { event_type: 'compliance_pick_up', vehicle_state: 'non_operational' },
    off_hours: { event_type: 'off_hours', vehicle_state: 'non_operational' }
  },
  trip_end: {
    no_event_type_reason: { event_type: 'trip_end', vehicle_state: 'available' }
  },
  trip_enter: {
    no_event_type_reason: { event_type: 'trip_enter_jurisdiction', vehicle_state: 'on_trip' }
  },
  trip_leave: {
    no_event_type_reason: { event_type: 'trip_leave_jurisdiction', vehicle_state: 'elsewhere' }
  },
  trip_start: {
    no_event_type_reason: { event_type: 'trip_start', vehicle_state: 'on_trip' }
  },
  /* We don't actually accept events with this event_type in Agency, but it's part of
   * the VEHICLE_EVENT_0_4_1 type, and Omit doesn't seem to work on types that
   * are string arrays, so it has to be here.
   */
  register: {
    no_event_type_reason: { event_type: 'unspecified', vehicle_state: 'unknown' }
  },
  /* This event_type exists only to ensure backconversions and should not be present in any
   * real events submitted via 0.4.1.
   */

  no_backconversion_available: {
    no_event_type_reason: { event_type: 'unspecified', vehicle_state: 'unknown' }
  }
}

function map_v_0_4_1_fields_to_v_1_0_0_fields(
  event_type: VEHICLE_EVENT_0_4_1,
  event_type_reason: VEHICLE_REASON_0_4_1 | null | undefined
): { event_type: VEHICLE_EVENT; vehicle_state: VEHICLE_STATE } {
  if (event_type_reason) {
    return FULL_STATE_MAPPING_0_4_1_to_1_0_0[event_type][event_type_reason]
  }
  return FULL_STATE_MAPPING_0_4_1_to_1_0_0[event_type].no_event_type_reason
}

export function convert_v0_4_1_to_v1_0_0(event: VehicleEvent_v0_4_1): VehicleEvent {
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
    recorded
  } = event
  const { event_type: new_event_type, vehicle_state } = map_v_0_4_1_fields_to_v_1_0_0_fields(
    event_type,
    event_type_reason
  )
  return {
    device_id,
    provider_id,
    timestamp,
    timestamp_long,
    delta,
    vehicle_state,
    event_types: [new_event_type],
    telemetry_timestamp,
    telemetry,
    trip_id,
    recorded
  }
}