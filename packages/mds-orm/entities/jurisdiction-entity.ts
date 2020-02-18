import { Entity, Column, Index } from 'typeorm'
import { UUID } from '@mds-core/mds-types'
import { RecordedPersistenceModel, RecordedEntity } from './recorded-entity'

export interface JursidictionPersistenceModel extends RecordedPersistenceModel {
  jurisdiction_id: UUID
  agency_key: string
  agency_name: string
}

@Entity('jurisdictions')
export class JurisdictionEntity extends RecordedEntity implements JursidictionPersistenceModel {
  @Column('uuid', { primary: true })
  jurisdiction_id: UUID

  @Column('varchar', { length: 31 })
  @Index({ unique: true })
  agency_key: string

  @Column('varchar', { length: 255 })
  agency_name: string
}
