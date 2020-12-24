import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { UUID } from '@mds-core/mds-types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LessThan, MoreThan, Between, FindOperator } from 'typeorm'
import {
  TransactionDomainModel,
  TransactionOperationDomainModel,
  TransactionSearchParams,
  TransactionStatusDomainModel
} from '../@types'
import {
  TransactionEntityToDomain,
  TransactionDomainToEntityCreate,
  TransactionOperationEntityToDomain,
  TransactionOperationDomainToEntityCreate,
  TransactionStatusEntityToDomain,
  TransactionStatusDomainToEntityCreate
} from './mappers'
import { TransactionEntity } from './entities/transaction-entity'
import { TransactionOperationEntity } from './entities/operation-entity'
import { TransactionStatusEntity } from './entities/status-entity'
import migrations from './migrations'

class TransactionReadWriteRepository extends ReadWriteRepository {
  public getTransaction = async (transaction_id: UUID): Promise<TransactionDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entity = await connection.getRepository(TransactionEntity).findOne({
        where: {
          transaction_id
        }
      })
      if (!entity) {
        throw new NotFoundError(`Transaction ${transaction_id} not found`)
      }
      return TransactionEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  // TODO search criteria, paging
  public getTransactions = async (search: TransactionSearchParams): Promise<TransactionDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      function where() : {provider_id?:UUID, timestamp?: FindOperator<number>} {
        const { provider_id, start_timestamp, end_timestamp} = search
        let timestamp
        if (start_timestamp && end_timestamp) {
          timestamp = Between(start_timestamp, end_timestamp)
        } else if (start_timestamp) {
          timestamp = MoreThan(start_timestamp)
        } else if (end_timestamp) {
          timestamp = LessThan(end_timestamp)
        }
        return { provider_id, timestamp }
    }
      const entities = await connection.getRepository(TransactionEntity).find({ where: where() })
      return entities.map(TransactionEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createTransaction = async (transaction: TransactionDomainModel): Promise<TransactionDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const {
        raw: [entity]
      }: InsertReturning<TransactionEntity> = await connection
        .getRepository(TransactionEntity)
        .createQueryBuilder()
        .insert()
        .values([TransactionDomainToEntityCreate.map(transaction)])
        .returning('*')
        .execute()
      return TransactionEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createTransactions = async (transactions: TransactionDomainModel[]): Promise<TransactionDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { raw: entities }: InsertReturning<TransactionEntity> = await connection
        .getRepository(TransactionEntity)
        .createQueryBuilder()
        .insert()
        .values(transactions.map(TransactionDomainToEntityCreate.mapper()))
        .returning('*')
        .execute()
      return entities.map(TransactionEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public addTransactionOperation = async (
    transactionOperation: TransactionOperationDomainModel
  ): Promise<TransactionOperationDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const {
        raw: [entity]
      }: InsertReturning<TransactionOperationEntity> = await connection
        .getRepository(TransactionOperationEntity)
        .createQueryBuilder()
        .insert()
        .values([TransactionOperationDomainToEntityCreate.map(transactionOperation)])
        .returning('*')
        .execute()
      return TransactionOperationEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  // TODO search criteria, paging
  public getTransactionOperations = async (transaction_id: UUID): Promise<TransactionOperationDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entities = await connection.getRepository(TransactionOperationEntity).find({ where: { transaction_id } })
      return entities.map(TransactionOperationEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public setTransactionStatus = async (
    transactionStatus: TransactionStatusDomainModel
  ): Promise<TransactionStatusDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const {
        raw: [entity]
      }: InsertReturning<TransactionStatusEntity> = await connection
        .getRepository(TransactionStatusEntity)
        .createQueryBuilder()
        .insert()
        .values([TransactionStatusDomainToEntityCreate.map(transactionStatus)])
        .returning('*')
        .execute()
      return TransactionStatusEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  // TODO search criteria, paging
  public getTransactionStatuses = async (transaction_id: UUID): Promise<TransactionStatusDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entities = await connection.getRepository(TransactionStatusEntity).find({ where: { transaction_id } })
      return entities.map(TransactionStatusEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  constructor() {
    super('transactions', {
      entities: [TransactionEntity, TransactionOperationEntity, TransactionStatusEntity],
      migrations
    })
  }
}

export const TransactionRepository = new TransactionReadWriteRepository()
