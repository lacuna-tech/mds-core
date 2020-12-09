import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { TransactionService } from '../@types'
import { TransactionRepository } from '../repository'
import {
  validateTransactionDomainModel,
  validateTransactionOperationDomainModel,
  validateTransactionStatusDomainModel
} from './validators'

export const TransactionServiceProvider: ServiceProvider<TransactionService> & ProcessController = {
  start: TransactionRepository.initialize,
  stop: TransactionRepository.shutdown,
  createTransaction: async transaction => {
    try {
      return ServiceResult(await TransactionRepository.createTransaction(validateTransactionDomainModel(transaction)))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transaction', error)
      logger.error(exception, error)
      return exception
    }
  },
  createTransactions: async transactions => {
    try {
      return ServiceResult(
        await TransactionRepository.createTransactions(transactions.map(validateTransactionDomainModel))
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transactions', error)
      logger.error(exception, error)
      return exception
    }
  },
  getTransaction: async (transaction_id: UUID) => {
    try {
      const transaction = await TransactionRepository.getTransaction(transaction_id)
      return ServiceResult(transaction)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting Transaction: ${transaction_id}`, error)
      logger.error(exception, error)
      return exception
    }
  },
  // TODO search params
  getTransactions: async () => {
    try {
      const transactions = await TransactionRepository.getTransactions()
      return ServiceResult(transactions)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transactions', error)
      logger.error(exception, error)
      return exception
    }
  },
  addTransactionOperation: async transactionOperation => {
    try {
      const operation = await TransactionRepository.addTransactionOperation(
        validateTransactionOperationDomainModel(transactionOperation)
      )
      return ServiceResult(operation)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transaction Operation', error)
      logger.error(exception, error)
      return exception
    }
  },
  // TODO search params
  getTransactionOperations: async (transaction_id: UUID) => {
    try {
      const operations = await TransactionRepository.getTransactionOperations(transaction_id)
      return ServiceResult(operations)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transaction Operations', error)
      logger.error(exception, error)
      return exception
    }
  },
  setTransactionStatus: async transactionStatus => {
    try {
      const status = await TransactionRepository.setTransactionStatus(
        validateTransactionStatusDomainModel(transactionStatus)
      )
      return ServiceResult(status)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transaction Status', error)
      logger.error(exception, error)
      return exception
    }
  },
  // TODO search params
  getTransactionStatuses: async (transaction_id: UUID) => {
    try {
      const statuses = await TransactionRepository.getTransactionStatuses(transaction_id)
      return ServiceResult(statuses)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transaction Operations', error)
      logger.error(exception, error)
      return exception
    }
  }
}
