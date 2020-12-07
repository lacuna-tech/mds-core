import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
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
  getTransaction: async transaction_id => {
    try {
      return ServiceResult(await TransactionRepository.getTransaction(transaction_id))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting Transaction: ${transaction_id}`, error)
      logger.error(exception, error)
      return exception
    }
  },
  // TODO search params
  getTransactions: async () => {
    try {
      return ServiceResult(await TransactionRepository.getTransactions())
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transactions', error)
      logger.error(exception, error)
      return exception
    }
  },
  addTransactionOperation: async transactionOperation => {
    try {
      return ServiceResult(
        await TransactionRepository.addTransactionOperation(
          validateTransactionOperationDomainModel(transactionOperation)
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transaction Operation', error)
      logger.error(exception, error)
      return exception
    }
  },
  // TODO search params
  getTransactionOperations: async () => {
    try {
      return ServiceResult(await TransactionRepository.getTransactionOperations())
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transaction Operations', error)
      logger.error(exception, error)
      return exception
    }
  },
  setTransactionStatus: async transactionStatus => {
    try {
      return ServiceResult(
        await TransactionRepository.setTransactionStatus(validateTransactionStatusDomainModel(transactionStatus))
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transaction Status', error)
      logger.error(exception, error)
      return exception
    }
  },
  // TODO search params
  getTransactionStatuses: async () => {
    try {
      return ServiceResult(await TransactionRepository.getTransactionStatuses())
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transaction Operations', error)
      logger.error(exception, error)
      return exception
    }
  }
}
