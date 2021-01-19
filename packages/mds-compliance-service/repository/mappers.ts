import { Optional, Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceSnapshotEntityModel } from './entities/compliance-snapshot-entity'
import {
  ComplianceSnapshotDomainModel,
  ComplianceViolationPeriodDomainModel,
  ComplianceViolationPeriodEntityModel
} from '../@types'

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

function encodeToken(ids: string[]): string {
  const buffer = Buffer.from(ids.join(','))
  return buffer.toString('base64')
}

export const ComplianceViolationPeriodEntityToDomainCreate = ModelMapper<
  ComplianceViolationPeriodEntityModel,
  ComplianceViolationPeriodDomainModel
>((entity, _) => {
  const { start_time, real_end_time: end_time, compliance_snapshot_ids } = entity
  return { start_time, end_time, compliance_snapshot_ids }
})
