import { Column, Index } from 'typeorm'
import { Timestamp } from '@mds-core/mds-types'
import { BigintTransformer } from '../transformers'
import { IdentityEntity, IdentityEntityModel } from './identity-entity'

export interface RecordedEntityModel extends IdentityEntityModel {
  recorded: Timestamp
}

export abstract class RecordedEntity extends IdentityEntity implements RecordedEntityModel {
  @Column('bigint', { transformer: BigintTransformer })
  @Index()
  recorded: Timestamp
}
