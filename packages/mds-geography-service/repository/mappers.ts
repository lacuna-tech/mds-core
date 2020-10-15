import { Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper } from '@mds-core/mds-repository'
import { GeographyEntityModel } from './entities/geography-entity'
import { GeographyDomainCreateModel, GeographyDomainModel } from '../@types'

type GeographyEntityToDomainOptions = Partial<{}>

export const GeographyEntityToDomain = ModelMapper<
  GeographyEntityModel,
  GeographyDomainModel,
  GeographyEntityToDomainOptions
>((entity, options) => {
  const {
    id,
    name = null,
    description = null,
    effective_date = null,
    publish_date = null,
    prev_geographies = null,
    ...domain
  } = entity
  return { name, description, effective_date, publish_date, prev_geographies, ...domain }
})

type GeographyEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type GeographyEntityCreateModel = Omit<GeographyEntityModel, keyof IdentityColumn>

export const GeographyDomainToEntityCreate = ModelMapper<
  GeographyDomainCreateModel,
  GeographyEntityCreateModel,
  GeographyEntityCreateOptions
>(
  (
    { name = null, description = null, effective_date = null, publish_date = null, prev_geographies = null, ...domain },
    options
  ) => {
    return { name, description, effective_date, publish_date, prev_geographies, ...domain }
  }
)
