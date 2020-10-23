import { Device, Telemetry, Timestamp, UUID, VehicleEvent, VEHICLE_EVENT, VEHICLE_STATE } from '@mds-core/mds-types'

export type VehicleEventWithTelemetry = VehicleEvent & { telemetry: Telemetry }
export type MatchedVehicleWithRule = { [d: string]: { device: Device; rule_applied?: UUID; rules_matched?: UUID[] } }

export interface MatchedVehicleInformation {
  device_id: UUID
  state: VEHICLE_STATE
  event_types: VEHICLE_EVENT[]
  timestamp: Timestamp
  /* Sometimes a device can match more than one rule, and it's helpful to know all of them,
     for instance, with a count policy.
  */
  rules_matched: UUID[]
  rule_applied?: UUID | null // a device can only ever match one rule at most for the purpose of computing compliance, however
  speed?: number | null
  gps: {
    lat: number
    lng: number
  }
}

export interface ComplianceResult {
  vehicles_found: MatchedVehicleInformation[]
  excess_vehicles_count: number
  total_violations: number
}
export type ComplianceResponse = ComplianceResult & {
  compliance_as_of: Timestamp
  compliance_id: UUID
  policy: {
    name: string
    policy_id: UUID
  }
  provider_id: UUID
}
