import { Optional, Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceSnapshotEntityModel } from './entities/ComplianceSnapshot-entity'
import { ComplianceSnapshotDomainCreateModel, ComplianceSnapshotDomainModel } from '../@types'

type ComplianceSnapshotEntityToDomainOptions = Partial<{}>

export const ComplianceSnapshotEntityToDomain = ModelMapper<ComplianceSnapshotEntityModel, ComplianceSnapshotDomainModel, ComplianceSnapshotEntityToDomainOptions>(
  (entity, options) => {
    const { id, recorded, ...domain } = entity
    return domain
  }
)

type ComplianceSnapshotEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type ComplianceSnapshotEntityCreateModel = Omit<Optional<ComplianceSnapshotEntityModel, keyof RecordedColumn>, keyof IdentityColumn>

export const ComplianceSnapshotDomainToEntityCreate = ModelMapper<
  ComplianceSnapshotDomainCreateModel,
  ComplianceSnapshotEntityCreateModel,
  ComplianceSnapshotEntityCreateOptions
>((domain, options) => {
  const { recorded } = options ?? {}
  return { ...domain, recorded }
})
