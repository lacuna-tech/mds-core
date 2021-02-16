/**
 * Copyright 2020 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { UUID } from '@mds-core/mds-types'
import Joi from 'joi'
import { buildPaginator, Cursor } from 'typeorm-cursor-pagination'
import { LessThan, MoreThan, Between, FindOperator } from 'typeorm'
import { schemaValidator } from '@mds-core/mds-schema-validators'
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

const { validate: validateTransactionSearchParams } = schemaValidator<TransactionSearchParams>(
  Joi.object<TransactionSearchParams>()
    .keys({
      provider_id: Joi.string().uuid(),
      start_timestamp: Joi.number().integer(),
      end_timestamp: Joi.number().integer(),
      before: Joi.string(),
      after: Joi.string(),
      limit: Joi.number().integer().min(1).max(1000).default(10)
    })
    .unknown(false)
)

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

  // TODO search criteria
  public getTransactions = async (
    search: TransactionSearchParams = {}
  ): Promise<{ transactions: TransactionDomainModel[]; cursor: Cursor }> => {
    const { connect } = this
    const { provider_id, start_timestamp, end_timestamp, before, after, limit } = validateTransactionSearchParams(
      search
    )
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
      const { data, cursor } = await buildPaginator({
        entity: TransactionEntity,
        query: {
          limit,
          order: 'ASC',
          afterCursor: after,
          beforeCursor: after ? undefined : before
        }
      }).paginate(queryBuilder)
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

  /**
   * @deprecated
   * **WARNING: This should ONLY be used during tests! Hence adding the deprecated flag.**
   * Deletes all transactions from the DB.
   */
  public deleteAllTransactions = async () => {
    const { connect } = this
    try {
      console.log('DELETING THE BOIS')
      const connection = await connect('rw')
      const repository = await connection.getRepository(TransactionEntity)

      await repository.query(`DELETE FROM ${repository.metadata.tableName};`)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  /**
   * @deprecated
   * **WARNING: This should ONLY be used during tests! Hence adding the deprecated flag.**
   * Deletes all transaction operations from the DB.
   */
  public deleteAllTransactionOperations = async () => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const repository = await connection.getRepository(TransactionOperationEntity)

      await repository.query(`DELETE FROM ${repository.metadata.tableName};`)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  /**
   * @deprecated
   * **WARNING: This should ONLY be used during tests! Hence adding the deprecated flag.**
   * Deletes all transaction statuses from the DB.
   */
  public deleteAllTransactionStatuses = async () => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const repository = await connection.getRepository(TransactionStatusEntity)

      await repository.query(`DELETE FROM ${repository.metadata.tableName};`)
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
