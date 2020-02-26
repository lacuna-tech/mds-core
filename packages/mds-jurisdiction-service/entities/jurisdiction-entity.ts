import { Entity, Column, Index } from 'typeorm'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { RecordedPersistenceModel, RecordedEntity } from '@mds-core/mds-orm/entities'
import { Nullable } from '@mds-core/mds-orm/types'

export interface JurisdictionVersionedProperties {
  timestamp: Timestamp
  agency_name: string
  geography_id: Nullable<UUID>
}

export interface JursidictionPersistenceModel extends RecordedPersistenceModel {
  jurisdiction_id: UUID
  agency_key: string
  versions: JurisdictionVersionedProperties[]
}

@Entity('jurisdictions')
export class JurisdictionEntity extends RecordedEntity implements JursidictionPersistenceModel {
  @Column('uuid', { primary: true })
  jurisdiction_id: UUID

  @Column('varchar', { length: 63 })
  @Index({ unique: true })
  agency_key: string

  @Column('json')
  versions: JurisdictionVersionedProperties[]
}
