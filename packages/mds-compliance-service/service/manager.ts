import { RpcServer } from '@mds-core/mds-rpc-common'
import { ComplianceServiceDefinition } from '../@types'
import { ComplianceServiceClient } from '../client'
import { ComplianceServiceProvider } from './provider'

export const ComplianceServiceManager = RpcServer(
  ComplianceServiceDefinition,
  {
    onStart: ComplianceServiceProvider.start,
    onStop: ComplianceServiceProvider.stop
  },
  {
    createComplianceSnapshot: args => ComplianceServiceProvider.createComplianceSnapshot(...args),
    createComplianceSnapshots: args => ComplianceServiceProvider.createComplianceSnapshots(...args),
    getComplianceSnapshot: args => ComplianceServiceProvider.getComplianceSnapshot(...args),
    getComplianceSnapshotsByTimeInterval: args =>
      ComplianceServiceProvider.getComplianceSnapshotsByTimeInterval(...args),
    getComplianceSnapshotsByIDs: args => ComplianceServiceProvider.getComplianceSnapshotsByIDs(...args)
  },
  {
    port: process.env.COMPLIANCE_SERVICE_RPC_PORT,
    repl: {
      port: process.env.COMPLIANCE_SERVICE_REPL_PORT,
      context: { client: ComplianceServiceClient }
    }
  }
)
