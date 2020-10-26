import { Device, Telemetry, Timestamp, UUID, VehicleEvent, VEHICLE_EVENT, VEHICLE_STATE } from '@mds-core/mds-types'

export type VehicleEventWithTelemetry = VehicleEvent & { telemetry: Telemetry }
export type MatchedVehicleWithRule = { [d: string]: { device: Device; rule_applied?: UUID; rules_matched?: UUID[] } }
