import { ServiceClient } from '@mds-core/mds-service-helpers'
import { RpcClient, RpcRequest } from '@mds-core/mds-rpc-common'
import { ComplianceService, ComplianceServiceDefinition } from '../@types'

const ComplianceServiceRpcClient = RpcClient(ComplianceServiceDefinition, {
  host: process.env.COMPLIANCESNAPSHOT_SERVICE_RPC_HOST,
  port: process.env.MCOMPLIANCESNAPSHOT_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const ComplianceServiceClient: ServiceClient<ComplianceService> = {
  getComplianceSnapshot: (...args) => RpcRequest(ComplianceServiceRpcClient.getComplianceSnapshot, args),
  getComplianceSnapshotsByTimeInterval: (...args) =>
    RpcRequest(ComplianceServiceRpcClient.getComplianceSnapshotsByTimeInterval, args),
  getComplianceSnapshotsByIDs: (...args) => RpcRequest(ComplianceServiceRpcClient.getComplianceSnapshotsByIDs, args),
  createComplianceSnapshot: (...args) => RpcRequest(ComplianceServiceRpcClient.createComplianceSnapshot, args),
  createComplianceSnapshots: (...args) => RpcRequest(ComplianceServiceRpcClient.createComplianceSnapshots, args)
}
