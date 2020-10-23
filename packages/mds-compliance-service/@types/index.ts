import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'

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
