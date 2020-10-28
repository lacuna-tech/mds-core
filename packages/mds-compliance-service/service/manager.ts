import { RpcServer } from '@mds-core/mds-rpc-common'
import { ComplianceSnapshotServiceDefinition } from '../@types'
import { ComplianceSnapshotServiceClient } from '../client'
import { ComplianceSnapshotServiceProvider } from './provider'

export const ComplianceSnapshotServiceManager = RpcServer(
  ComplianceSnapshotServiceDefinition,
  {
    onStart: ComplianceSnapshotServiceProvider.start,
    onStop: ComplianceSnapshotServiceProvider.stop
  },
  {
    createComplianceSnapshot: args => ComplianceSnapshotServiceProvider.createComplianceSnapshot(...args),
    createComplianceSnapshots: args => ComplianceSnapshotServiceProvider.createComplianceSnapshots(...args),
    getComplianceSnapshot: args => ComplianceSnapshotServiceProvider.getComplianceSnapshot(...args),
    getComplianceSnapshotsByTimeInterval: args =>
      ComplianceSnapshotServiceProvider.getComplianceSnapshotsByTimeInterval(...args),
    getComplianceSnapshotsByIDs: args => ComplianceSnapshotServiceProvider.getComplianceSnapshotsByIDs(...args),
    updateComplianceSnapshot: args => ComplianceSnapshotServiceProvider.updateComplianceSnapshot(...args),
    deleteComplianceSnapshot: args => ComplianceSnapshotServiceProvider.deleteComplianceSnapshot(...args)
  },
  {
    port: process.env.COMPLIANCE_SNAPSHOT_SERVICE_RPC_PORT,
    repl: {
      port: process.env.COMPLIANCE_SNAPSHOT_SERVICE_REPL_PORT,
      context: { client: ComplianceSnapshotServiceClient }
    }
  }
)
