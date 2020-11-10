import { ServiceClient } from '@mds-core/mds-service-helpers'
import { RpcClient, RpcRequest } from '@mds-core/mds-rpc-common'
import { ComplianceSnapshotService, ComplianceSnapshotServiceDefinition } from '../@types'

const ComplianceSnapshotServiceRpcClient = RpcClient(ComplianceSnapshotServiceDefinition, {
  host: process.env.COMPLIANCESNAPSHOT_SERVICE_RPC_HOST,
  port: process.env.MCOMPLIANCESNAPSHOT_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const ComplianceSnapshotServiceClient: ServiceClient<ComplianceSnapshotService> = {
  getComplianceSnapshot: (...args) => RpcRequest(ComplianceSnapshotServiceRpcClient.getComplianceSnapshot, args),
  getComplianceSnapshotsByTimeInterval: (...args) =>
    RpcRequest(ComplianceSnapshotServiceRpcClient.getComplianceSnapshotsByTimeInterval, args),
  getComplianceSnapshotsByIDs: (...args) =>
    RpcRequest(ComplianceSnapshotServiceRpcClient.getComplianceSnapshotsByIDs, args),
  createComplianceSnapshot: (...args) => RpcRequest(ComplianceSnapshotServiceRpcClient.createComplianceSnapshot, args),
  createComplianceSnapshots: (...args) => RpcRequest(ComplianceSnapshotServiceRpcClient.createComplianceSnapshots, args)
}
