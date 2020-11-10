import { ServiceClient } from '@mds-core/mds-service-helpers'
import { RpcClient, RpcRequest } from '@mds-core/mds-rpc-common'
import { TransactionService, TransactionServiceDefinition } from '../@types'

const TransactionServiceRpcClient = RpcClient(TransactionServiceDefinition, {
  host: process.env.TRANSACTION_SERVICE_RPC_HOST,
  port: process.env.MTRANSACTION_SERVICE_RPC_PORT
})

// What the API layer, and any other clients, will invoke.
export const TransactionServiceClient: ServiceClient<TransactionService> = {
  getTransaction: (...args) => RpcRequest(TransactionServiceRpcClient.getTransaction, args),
  getTransactions: (...args) => RpcRequest(TransactionServiceRpcClient.getTransactions, args),
  createTransaction: (...args) => RpcRequest(TransactionServiceRpcClient.createTransaction, args),
  createTransactions: (...args) => RpcRequest(TransactionServiceRpcClient.createTransactions, args),
  deleteTransaction: (...args) => RpcRequest(TransactionServiceRpcClient.deleteTransaction, args),
  updateTransaction: (...args) => RpcRequest(TransactionServiceRpcClient.updateTransaction, args)
}
