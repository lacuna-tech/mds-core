import { Optional, Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { TransactionEntityModel } from './entities/transaction-entity'
import { TransactionDomainCreateModel, TransactionDomainModel } from '../@types'

type TransactionEntityToDomainOptions = Partial<{}>

export const TransactionEntityToDomain = ModelMapper<TransactionEntityModel, TransactionDomainModel, TransactionEntityToDomainOptions>(
  (entity, options) => {
    const { id, recorded, ...domain } = entity
    return domain
  }
)

type TransactionEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type TransactionEntityCreateModel = Omit<Optional<TransactionEntityModel, keyof RecordedColumn>, keyof IdentityColumn>

export const TransactionDomainToEntityCreate = ModelMapper<
  TransactionDomainCreateModel,
  TransactionEntityCreateModel,
  TransactionEntityCreateOptions
>((domain, options) => {
  const { recorded } = options ?? {}
  return { ...domain, recorded }
})
