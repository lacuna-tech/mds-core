import { Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper } from '@mds-core/mds-repository'
import { TelemetryEntityModel } from '../entities/device-entity'
import { TelemetryDomainCreateModel, TelemetryDomainModel } from '../../@types'

type TelemetryEntityToDomainOptions = Partial<{}>

export const TelemetryEntityToDomain = ModelMapper<
  TelemetryEntityModel,
  TelemetryDomainModel,
  TelemetryEntityToDomainOptions
>((entity, options) => {
  const { id, ...domain } = entity
  return { ...domain }
})

type TelemetryEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type TelemetryEntityCreateModel = Omit<TelemetryEntityModel, keyof IdentityColumn>

export const TelemetryDomainToEntityCreate = ModelMapper<
  TelemetryDomainCreateModel,
  TelemetryEntityCreateModel,
  TelemetryEntityCreateOptions
>(({ ...domain }, options) => {
  return { ...domain }
})
