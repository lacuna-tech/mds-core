import { Entity, Column, Index } from 'typeorm'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { RecordedPersistenceModel, RecordedEntity } from './recorded-entity'
import { Nullable } from './types'
import { BigintTransformer } from './transformers'

export interface JursidictionVersionPersistenceModel extends RecordedPersistenceModel {
  jurisdiction_id: UUID
  active_timestamp: Timestamp
  inactive_timestamp: Nullable<Timestamp>
  geography_id: UUID
}

@Entity('jurisdiction_versions')
@Index(['jurisdiction_id', 'inactive_timestamp'], { unique: true })
export class JurisdictionVersionEntity extends RecordedEntity implements JursidictionVersionPersistenceModel {
  @Column('uuid', { primary: true })
  jurisdiction_id: UUID

  @Column('bigint', { primary: true, transformer: BigintTransformer })
  active_timestamp: Timestamp

  @Column('bigint', { nullable: true, transformer: BigintTransformer })
  inactive_timestamp: Nullable<Timestamp>

  @Column('uuid')
  geography_id: UUID
}
