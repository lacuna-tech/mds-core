import { Optional, Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceSnapshotEntityModel } from './entities/compliance-snapshot-entity'
import { ComplianceArrayResponseEntityModel } from './entities/compliance-array-response-entity'
import { ComplianceSnapshotDomainModel, ComplianceArrayResponseDomainModel } from '../@types'

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
  const {
    policy: { policy_id, name: policy_name },
    ...entity
  } = domain
  return { ...entity, policy_name, policy_id, recorded }
})

type ComplianceArrayResponseEntityToDomainOptions = Partial<{}>

export const ComplianceArrayResponseEntityToDomain = ModelMapper<
  ComplianceArrayResponseEntityModel,
  ComplianceArrayResponseDomainModel,
  ComplianceArrayResponseEntityToDomainOptions
>((entity, options) => {
  const { provider_id, compliance_array_response_id, compliance_snapshot_ids } = entity
  return {
    provider_id,
    compliance_array_response_id,
    compliance_snapshot_ids: compliance_snapshot_ids.split(',')
  }
})

type ComplianceArrayResponseEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type ComplianceArrayResponseEntityCreateModel = Omit<
  Optional<ComplianceArrayResponseEntityModel, keyof RecordedColumn>,
  keyof IdentityColumn
>

export const ComplianceArrayResponseDomainToEntityCreate = ModelMapper<
  ComplianceArrayResponseDomainModel,
  ComplianceArrayResponseEntityCreateModel,
  ComplianceArrayResponseEntityCreateOptions
>((domain, options) => {
  const { recorded } = options ?? {}
  const { compliance_snapshot_ids, provider_id, compliance_array_response_id } = domain
  return {
    compliance_array_response_id,
    provider_id,
    compliance_snapshot_ids: compliance_snapshot_ids.join(','),
    recorded
  }
})
