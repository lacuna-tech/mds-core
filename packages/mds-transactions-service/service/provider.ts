import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
import { TransactionService } from '../@types'
import { TransactionRepository } from '../repository'
import { validateTransactionDomainModel } from './validators'

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
      return ServiceResult(await TransactionRepository.createTransactions(transactions.map(validateTransactionDomainModel)))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Transactions', error)
      logger.error(exception, error)
      return exception
    }
  },
  getTransaction: async name => {
    try {
      return ServiceResult(await TransactionRepository.getTransaction(name))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting Transaction: ${name}`, error)
      logger.error(exception, error)
      return exception
    }
  },
  getTransactions: async () => {
    try {
      return ServiceResult(await TransactionRepository.getTransactions())
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Transactions', error)
      logger.error(exception, error)
      return exception
    }
  },
  updateTransaction: async transaction => {
    try {
      return ServiceResult(await TransactionRepository.updateTransaction(transaction))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Updating Transaction', error)
      logger.error(exception, error)
      return exception
    }
  },
  deleteTransaction: async name => {
    try {
      return ServiceResult(await TransactionRepository.deleteTransaction(name))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Deleting Transaction: ${name}`, error)
      logger.error(exception, error)
      return exception
    }
  }
}
