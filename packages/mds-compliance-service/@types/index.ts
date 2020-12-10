import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'
import { UUID, Timestamp, VEHICLE_STATE, VEHICLE_EVENT } from '@mds-core/mds-types'

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

export interface ComplianceSnapshotDomainModel {
  compliance_as_of: Timestamp
  compliance_snapshot_id: UUID
  policy: {
    name: string
    policy_id: UUID
  }
  provider_id: UUID
  vehicles_found: MatchedVehicleInformation[]
  excess_vehicles_count: number
  total_violations: number
}

export type GetComplianceSnapshotOptions =
  | {
      compliance_snapshot_id: UUID
    }
  | {
      provider_id: UUID
      policy_id: UUID
      compliance_as_of: Timestamp
    }

export type GetComplianceSnapshotsByTimeIntervalOptions = Partial<{
  start_time: Timestamp
  end_time: Timestamp
  policy_ids: UUID[]
  provider_ids: UUID[]
}>

export interface ComplianceArrayResponseDomainModel {
  compliance_array_response_id: UUID
  compliance_snapshot_ids: UUID[]
  provider_id: string
}

export interface ComplianceService {
  createComplianceSnapshots: (complianceSnapshots: ComplianceSnapshotDomainModel[]) => ComplianceSnapshotDomainModel[]
  createComplianceSnapshot: (complianceSnapshot: ComplianceSnapshotDomainModel) => ComplianceSnapshotDomainModel
  getComplianceSnapshotsByTimeInterval: (
    options: GetComplianceSnapshotsByTimeIntervalOptions
  ) => ComplianceSnapshotDomainModel[]
  getComplianceSnapshotsByIDs: (ids: UUID[]) => ComplianceSnapshotDomainModel[]
  getComplianceSnapshot: (options: GetComplianceSnapshotOptions) => ComplianceSnapshotDomainModel
  createComplianceArrayResponse: (
    complianceArrayResponse: ComplianceArrayResponseDomainModel
  ) => ComplianceArrayResponseDomainModel
  getComplianceArrayResponse: (complianceArrayResponseID: UUID) => ComplianceArrayResponseDomainModel
}

export const ComplianceServiceDefinition: RpcServiceDefinition<ComplianceService> = {
  createComplianceSnapshots: RpcRoute<ComplianceService['createComplianceSnapshots']>(),
  createComplianceSnapshot: RpcRoute<ComplianceService['createComplianceSnapshot']>(),
  getComplianceSnapshotsByTimeInterval: RpcRoute<ComplianceService['getComplianceSnapshotsByTimeInterval']>(),
  getComplianceSnapshotsByIDs: RpcRoute<ComplianceService['getComplianceSnapshotsByIDs']>(),
  getComplianceSnapshot: RpcRoute<ComplianceService['getComplianceSnapshot']>(),
  createComplianceArrayResponse: RpcRoute<ComplianceService['createComplianceArrayResponse']>(),
  getComplianceArrayResponse: RpcRoute<ComplianceService['getComplianceArrayResponse']>()
}
