import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'
import { Nullable, Timestamp, UUID } from '@mds-core/mds-types'
import { FeatureCollection } from 'geojson'

export interface GeographyDomainModel {
  geography_id: UUID
  name: Nullable<string>
  description: Nullable<string>
  effective_date: Nullable<Timestamp>
  publish_date: Nullable<Timestamp>
  prev_geographies: Nullable<UUID[]>
  geography_json: FeatureCollection
}

export type GeographyDomainCreateModel = DomainModelCreate<GeographyDomainModel>

export interface GeographyMetadataDomainModel<M extends {} = {}> {
  geography_id: UUID
  geography_metadata: Nullable<M>
}

export type GeographyMetadataDomainCreateModel = DomainModelCreate<GeographyMetadataDomainModel>

export const GeographyStatus = ['draft', 'published'] as const
export type GeographyStatus = typeof GeographyStatus[number]

export type GetGeographiesOptions = Partial<{
  status: GeographyStatus
}>

export type GeographyWithMetadataDomainModel<M extends {} = {}> = GeographyDomainModel &
  Pick<GeographyMetadataDomainModel<M>, 'geography_metadata'>

export interface GeographyService {
  getGeographies: (options?: GetGeographiesOptions) => GeographyDomainModel[]
  getGeographiesWithMetadata: (options?: GetGeographiesOptions) => GeographyWithMetadataDomainModel[]
  getGeography: (geography_id: GeographyDomainModel['geography_id']) => GeographyDomainModel
  getGeographyWithMetadata: (geography_id: GeographyDomainModel['geography_id']) => GeographyWithMetadataDomainModel
  writeGeographies: (geographies: GeographyDomainCreateModel[]) => GeographyDomainModel[]
  writeGeographiesMetadata: (metadata: GeographyMetadataDomainCreateModel[]) => GeographyMetadataDomainModel[]
}

export const GeographyServiceDefinition: RpcServiceDefinition<GeographyService> = {
  getGeographies: RpcRoute<GeographyService['getGeographies']>(),
  getGeographiesWithMetadata: RpcRoute<GeographyService['getGeographiesWithMetadata']>(),
  getGeography: RpcRoute<GeographyService['getGeography']>(),
  getGeographyWithMetadata: RpcRoute<GeographyService['getGeographyWithMetadata']>(),
  writeGeographies: RpcRoute<GeographyService['writeGeographies']>(),
  writeGeographiesMetadata: RpcRoute<GeographyService['writeGeographiesMetadata']>()
}
