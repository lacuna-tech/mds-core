import { DomainModelCreate } from '@mds-core/mds-repository'
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

export type ComplianceSnapshot = {
  compliance_as_of: Timestamp
  compliance_id: UUID
  policy: {
    name: string
    policy_id: UUID
  }
  provider_id: UUID
  vehicles_found: MatchedVehicleInformation[]
  excess_vehicles_count: number
  total_violations: number
}
export interface ComplianceSnapshotDomainModel {
  name: string
  text: string
}

export type ComplianceSnapshotDomainCreateModel = DomainModelCreate<ComplianceSnapshotDomainModel>

export interface ComplianceSnapshotService {
  createComplianceSnapshots: (
    complianceSnapshots: ComplianceSnapshotDomainCreateModel[]
  ) => ComplianceSnapshotDomainModel[]
  createComplianceSnapshot: (ComplianceSnapshot: ComplianceSnapshotDomainCreateModel) => ComplianceSnapshotDomainModel
  getComplianceSnapshots: () => ComplianceSnapshotDomainModel[]
  getComplianceSnapshot: (name: string) => ComplianceSnapshotDomainModel
  updateComplianceSnapshot: (ComplianceSnapshot: ComplianceSnapshotDomainModel) => ComplianceSnapshotDomainModel
  deleteComplianceSnapshot: (name: string) => ComplianceSnapshotDomainModel['name']
}

export const ComplianceSnapshotServiceDefinition: RpcServiceDefinition<ComplianceSnapshotService> = {
  createComplianceSnapshots: RpcRoute<ComplianceSnapshotService['createComplianceSnapshots']>(),
  createComplianceSnapshot: RpcRoute<ComplianceSnapshotService['createComplianceSnapshot']>(),
  getComplianceSnapshots: RpcRoute<ComplianceSnapshotService['getComplianceSnapshots']>(),
  getComplianceSnapshot: RpcRoute<ComplianceSnapshotService['getComplianceSnapshot']>(),
  updateComplianceSnapshot: RpcRoute<ComplianceSnapshotService['updateComplianceSnapshot']>(),
  deleteComplianceSnapshot: RpcRoute<ComplianceSnapshotService['deleteComplianceSnapshot']>()
}
