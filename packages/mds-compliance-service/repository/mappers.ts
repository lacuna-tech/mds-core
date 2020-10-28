import { Optional, Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceSnapshotEntityModel } from './entities/compliance-snapshot-entity'
import { ComplianceSnapshotDomainModel } from '../@types'

type ComplianceSnapshotEntityToDomainOptions = Partial<{}>

export const ComplianceSnapshotEntityToDomain = ModelMapper<
  ComplianceSnapshotEntityModel,
  ComplianceSnapshotDomainModel,
  ComplianceSnapshotEntityToDomainOptions
>((entity, options) => {
  const { id, recorded, policy_id, policy_name, ...domain } = entity
  return {
    policy: {
      policy_id,
      name: policy_name
    },
    ...domain
  }
})

type ComplianceSnapshotEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type ComplianceSnapshotEntityCreateModel = Omit<
  Optional<ComplianceSnapshotEntityModel, keyof RecordedColumn>,
  keyof IdentityColumn
>

export const ComplianceSnapshotDomainToEntityCreate = ModelMapper<
  ComplianceSnapshotDomainModel,
  ComplianceSnapshotEntityCreateModel,
  ComplianceSnapshotEntityCreateOptions
>((domain, options) => {
  const { recorded } = options ?? {}
  const { policy, ...entity } = domain
  const policy_name = policy.name
  const { policy_id } = domain.policy
  return { ...entity, policy_name, policy_id, recorded }
})
