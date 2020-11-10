import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'

export interface TransactionDomainModel {
  name: string
  text: string
}

export type TransactionDomainCreateModel = DomainModelCreate<TransactionDomainModel>

export interface TransactionService {
  createTransactions: (transactions: TransactionDomainCreateModel[]) => TransactionDomainModel[]
  createTransaction: (transaction: TransactionDomainCreateModel) => TransactionDomainModel
  getTransactions: () => TransactionDomainModel[]
  getTransaction: (name: string) => TransactionDomainModel
  updateTransaction: (transaction: TransactionDomainModel) => TransactionDomainModel
  deleteTransaction: (name: string) => TransactionDomainModel['name']
}

export const TransactionServiceDefinition: RpcServiceDefinition<TransactionService> = {
  createTransactions: RpcRoute<TransactionService['createTransactions']>(),
  createTransaction: RpcRoute<TransactionService['createTransaction']>(),
  getTransactions: RpcRoute<TransactionService['getTransactions']>(),
  getTransaction: RpcRoute<TransactionService['getTransaction']>(),
  updateTransaction: RpcRoute<TransactionService['updateTransaction']>(),
  deleteTransaction: RpcRoute<TransactionService['deleteTransaction']>()
}
