import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { TransactionDomainModel } from '../@types'
import { TransactionEntityToDomain, TransactionDomainToEntityCreate } from './mappers'
import { TransactionEntity, TransactionEntityModel } from './entities/transaction-entity'
import migrations from './migrations'

class TransactionReadWriteRepository extends ReadWriteRepository {
  public getTransaction = async (name: string): Promise<TransactionDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entity = await connection.getRepository(TransactionEntity).findOne({
        where: {
          name
        }
      })
      if (!entity) {
        throw new NotFoundError(`Transaction ${name} not found`)
      }
      return TransactionEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public updateTransaction = async (update: TransactionDomainModel): Promise<TransactionDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { name } = update
      const currentTransaction = await connection.getRepository(TransactionEntity).findOne({ where: { name } })
      if (!currentTransaction) {
        throw new NotFoundError(`Transaction ${name} not found`)
      }
      const {
        raw: [updated]
      } = await connection
        .getRepository(TransactionEntity)
        .createQueryBuilder()
        .update()
        .set({
          ...currentTransaction,
          ...TransactionDomainToEntityCreate.map(update)
        })
        .where('name = :name', { name })
        .returning('*')
        .execute()
      return TransactionEntityToDomain.map(updated)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public getTransactions = async (): Promise<TransactionDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entities = await connection.getRepository(TransactionEntity).find()
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

  public deleteTransaction = async (name: TransactionEntityModel['name']): Promise<TransactionEntityModel['name']> => {
    const { connect, getTransaction } = this
    // Try to read transaction first, if not 404
    await getTransaction(name)
    try {
      const connection = await connect('rw')
      await connection
        .getRepository(TransactionEntity)
        .createQueryBuilder()
        .delete()
        .where('name = :name', { name })
        .returning('*')
        .execute()
      return name
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  constructor() {
    super('transactions', {
      entities: [TransactionEntity],
      migrations
    })
  }
}

export const TransactionRepository = new TransactionReadWriteRepository()
