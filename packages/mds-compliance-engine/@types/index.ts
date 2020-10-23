import { Device, Telemetry, Timestamp, UUID, VehicleEvent, VEHICLE_EVENT, VEHICLE_STATE } from '@mds-core/mds-types'

export type VehicleEventWithTelemetry = VehicleEvent & { telemetry: Telemetry }
export type MatchedVehicleWithRule = { [d: string]: { device: Device; rule_applied?: UUID; rules_matched?: UUID[] } }

export interface MatchedVehicleInformation {
  device_id: UUID
  state: VEHICLE_STATE
  event_types: VEHICLE_EVENT[]
  timestamp: Timestamp
  /** A vehicle/event pair may match the *logical criteria* for multiple rules within a policy */
  rules_matched: UUID[]
  /** Only one rule can be *applied* to a vehicle/event pair in the context of compliance */
  rule_applied?: UUID
  speed?: number
  gps: {
    lat: number
    lng: number
  }
}

export interface ComplianceEngineResult {
  vehicles_found: MatchedVehicleInformation[]
  excess_vehicles_count: number
  total_violations: number
}
export type ComplianceSnapshot = ComplianceEngineResult & {
  compliance_as_of: Timestamp
  compliance_id: UUID
  policy: {
    name: string
    policy_id: UUID
  }
  provider_id: UUID
}
