import { VEHICLE_EVENT } from '@mds-core/mds-types'

const DEFAULT_STATE_EDGES = {
  agency_drop_off: false,
  agency_pick_up: false,
  battery_charged: false,
  battery_low: false,
  comms_lost: false,
  comms_restored: false,
  compliance_pick_up: false,
  decommissioned: false,
  maintenance: false,
  maintenance_pick_up: false,
  missing: false,
  off_hours: false,
  on_hours: false,
  provider_drop_off: false,
  rebalance_pick_up: false,
  reservation_cancel: false,
  reservation_start: false,
  system_resume: false,
  system_suspend: false,
  trip_cancel: false,
  trip_end: false,
  trip_enter_jurisdiction: false,
  trip_leave_jurisdiction: false,
  trip_start: false,
  unspecified: false
}

// Events that can take you out of the `available` state
const AVAILABLE_STATE_EDGES = {
  agency_pick_up: true,
  battery_low: true,
  comms_lost: true,
  compliance_pick_up: true,
  decommissioned: true,
  maintenance: true,
  maintenance_pick_up: true,
  missing: true,
  off_hours: true,
  rebalance_pick_up: true,
  reservation_start: true,
  system_suspend: true,
  trip_start: true,
  unspecified: true
}

// Events that can take you out of the `elsewhere` state
const ELSEWHERE_STATE_EDGES = {
  agency_drop_off: true,
  agency_pick_up: true,
  comms_lost: true,
  compliance_pick_up: true,
  decommissioned: true,
  maintenance_pick_up: true,
  missing: true,
  provider_drop_off: true,
  rebalance_pick_up: true,
  trip_enter_jurisdiction: true,
  unspecified: true
}

// Events that can take you out of the `non_operational` state
const NON_OPERATIONAL_STATE_EDGES = {
  agency_pick_up: true,
  battery_charged: true,
  comms_lost: true,
  compliance_pick_up: true,
  decommissioned: true,
  maintenance: true,
  maintenance_pick_up: true,
  missing: true,
  on_hours: true,
  rebalance_pick_up: true,
  system_resume: true,
  unspecified: true
}

// Events that can take you out of the `removed` state
const REMOVED_STATE_EDGES = {
  agency_drop_off: true,
  decommissioned: true,
  provider_drop_off: true,
  unspecified: true
}

// Events that can take you out of the `reserved` state
const RESERVED_STATE_EDGES = {
  comms_lost: true,
  missing: true,
  reservation_cancel: true,
  trip_start: true,
  unspecified: true
}

// Events that can take you out of the `on_trip` state
const ON_TRIP_STATE_EDGES = {
  comms_lost: true,
  missing: true,
  trip_cancel: true,
  trip_end: true,
  trip_leave_jurisdiction: true
}

// Events that can take you out of the `unknown` state
const UNKNOWN_STATE_EDGES = {
  agency_drop_off: true,
  agency_pick_up: true,
  comms_restored: true,
  decommissioned: true,
  provider_drop_off: true,
  unspecified: true
}

// The keys represent edges going into a state.
export const expectedTransitions: {
  [A in VEHICLE_EVENT]: {
    [B in VEHICLE_EVENT]: boolean
  }
} = {
  agency_drop_off: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  agency_pick_up: { ...DEFAULT_STATE_EDGES, ...REMOVED_STATE_EDGES },
  battery_charged: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  battery_low: { ...DEFAULT_STATE_EDGES, ...NON_OPERATIONAL_STATE_EDGES },
  comms_lost: { ...DEFAULT_STATE_EDGES, ...UNKNOWN_STATE_EDGES },
  comms_restored: {
    ...DEFAULT_STATE_EDGES,
    ...AVAILABLE_STATE_EDGES,
    ...ELSEWHERE_STATE_EDGES,
    ...RESERVED_STATE_EDGES,
    ...ON_TRIP_STATE_EDGES,
    ...NON_OPERATIONAL_STATE_EDGES
  },
  compliance_pick_up: { ...DEFAULT_STATE_EDGES, ...REMOVED_STATE_EDGES },
  decommissioned: { ...DEFAULT_STATE_EDGES, ...REMOVED_STATE_EDGES },
  maintenance: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES, ...NON_OPERATIONAL_STATE_EDGES },
  maintenance_pick_up: { ...DEFAULT_STATE_EDGES, ...REMOVED_STATE_EDGES },
  missing: { ...DEFAULT_STATE_EDGES, ...UNKNOWN_STATE_EDGES },
  off_hours: { ...DEFAULT_STATE_EDGES, ...NON_OPERATIONAL_STATE_EDGES },
  on_hours: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  provider_drop_off: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  rebalance_pick_up: { ...DEFAULT_STATE_EDGES, ...REMOVED_STATE_EDGES },
  reservation_cancel: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  reservation_start: { ...DEFAULT_STATE_EDGES, ...RESERVED_STATE_EDGES },
  system_resume: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  system_suspend: { ...DEFAULT_STATE_EDGES, ...NON_OPERATIONAL_STATE_EDGES },
  trip_cancel: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  trip_end: { ...DEFAULT_STATE_EDGES, ...AVAILABLE_STATE_EDGES },
  trip_enter_jurisdiction: { ...DEFAULT_STATE_EDGES, ...ON_TRIP_STATE_EDGES },
  trip_leave_jurisdiction: { ...DEFAULT_STATE_EDGES, ...ELSEWHERE_STATE_EDGES },
  trip_start: { ...DEFAULT_STATE_EDGES, ...ON_TRIP_STATE_EDGES },
  unspecified: {
    ...DEFAULT_STATE_EDGES,
    ...AVAILABLE_STATE_EDGES,
    ...NON_OPERATIONAL_STATE_EDGES,
    ...REMOVED_STATE_EDGES
  }
}
