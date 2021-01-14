import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { UUID } from '@mds-core/mds-types'
import { buildPaginator, Cursor, PagingQuery } from 'typeorm-cursor-pagination'
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
  public getTransactions = async (
    search: TransactionSearchParams
  ): Promise<{ transactions: TransactionDomainModel[]; cursor: Cursor }> => {
    const { connect } = this
    const { provider_id, start_timestamp, end_timestamp, before, after } = search
    function when(): { timestamp?: FindOperator<number> } {
      if (start_timestamp && end_timestamp) {
        return { timestamp: Between(start_timestamp, end_timestamp) }
      }
      if (start_timestamp) {
        return { timestamp: MoreThan(start_timestamp) }
      }
      if (end_timestamp) {
        return { timestamp: LessThan(end_timestamp) }
      }
      return {}
    }
    function who(): { provider_id?: UUID } {
      return provider_id ? { provider_id } : {}
    }
    try {
      const connection = await connect('ro')
      const queryBuilder = connection
        .getRepository(TransactionEntity)
        .createQueryBuilder('transactionentity') // yuk!
        .where({ ...who(), ...when() })
      const query: PagingQuery = {
        limit: 10,
        order: 'ASC'
      }
      // probably cleaner way to do this? not sure.
      // also i'm tolerating both before and after and using just after in that case.
      if (after) {
        query.afterCursor = after
      } else if (before) {
        query.beforeCursor = before
      }
      const { data, cursor } = await buildPaginator({ entity: TransactionEntity, query }).paginate(queryBuilder)
      return { transactions: data.map(TransactionEntityToDomain.mapper()), cursor }
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
