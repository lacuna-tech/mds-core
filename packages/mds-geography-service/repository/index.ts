import { InsertReturning, ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import { In, IsNull, MoreThan, Not } from 'typeorm'
import {
  GeographyDomainCreateModel,
  GeographyDomainModel,
  GeographyMetadataDomainCreateModel,
  GeographyMetadataDomainModel,
  GeographyWithMetadataDomainModel,
  GetGeographiesOptions,
  GetPublishedGeographiesOptions
} from '../@types'
import { GeographyMetadataEntity } from './entities/geography-metadata-entity'
import {
  GeographyDomainToEntityCreate,
  GeographyEntityToDomain,
  GeographyMetadataDomainToEntityCreate,
  GeographyMetadataEntityToDomain
} from './mappers'
import { GeographyEntity } from './entities/geography-entity'
import migrations from './migrations'

class GeographyReadWriteRepository extends ReadWriteRepository {
  protected getGeographyMetadata = async (
    geographies: GeographyDomainModel[]
  ): Promise<Map<GeographyDomainModel['geography_id'], GeographyMetadataDomainModel['geography_metadata']>> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      return new Map(
        geographies.length > 0
          ? (
              await connection.getRepository(GeographyMetadataEntity).find({
                where: { geography_id: In(geographies.map(geography => geography.geography_id)) }
              })
            ).map(entity => [entity.geography_id, entity.geography_metadata])
          : []
      )
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public readGeography = async (
    geography_id: GeographyDomainModel['geography_id'],
    { includeMetadata = false }: GetGeographiesOptions = {}
  ): Promise<GeographyWithMetadataDomainModel | undefined> => {
    const { connect, getGeographyMetadata } = this
    try {
      const connection = await connect('ro')

      const entity = await connection.getRepository(GeographyEntity).findOne({ where: { geography_id } })

      const geography = entity && GeographyEntityToDomain.map(entity)

      if (geography && includeMetadata) {
        const metadata = await getGeographyMetadata([geography])
        return { ...geography, geography_metadata: metadata.get(geography_id) ?? null }
      }

      return geography
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public readGeographies = async ({ includeMetadata = false }: GetGeographiesOptions = {}): Promise<
    GeographyWithMetadataDomainModel[]
  > => {
    const { connect, getGeographyMetadata } = this
    try {
      const connection = await connect('ro')

      const entities = await connection.getRepository(GeographyEntity).find()

      const geographies = entities.map(GeographyEntityToDomain.mapper())

      if (includeMetadata) {
        const metadata = await getGeographyMetadata(geographies)
        return geographies.map(geography => ({
          ...geography,
          geography_metadata: metadata.get(geography.geography_id) ?? null
        }))
      }

      return geographies
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public readUnpublishedGeographies = async ({ includeMetadata = false }: GetGeographiesOptions = {}): Promise<
    GeographyWithMetadataDomainModel[]
  > => {
    const { connect, getGeographyMetadata } = this
    try {
      const connection = await connect('ro')

      const entities = await connection.getRepository(GeographyEntity).find({
        where: {
          publish_date: IsNull()
        }
      })

      const geographies = entities.map(GeographyEntityToDomain.mapper())

      if (includeMetadata) {
        const metadata = await getGeographyMetadata(geographies)
        return geographies.map(geography => ({
          ...geography,
          geography_metadata: metadata.get(geography.geography_id) ?? null
        }))
      }

      return geographies
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public readPublishedGeographies = async ({
    includeMetadata = false,
    publishedAfter
  }: GetPublishedGeographiesOptions = {}): Promise<GeographyWithMetadataDomainModel[]> => {
    const { connect, getGeographyMetadata } = this
    try {
      const connection = await connect('ro')

      const entities = await connection
        .getRepository(GeographyEntity)
        .find({ where: { publish_date: publishedAfter ? MoreThan(publishedAfter) : Not(IsNull()) } })

      const geographies = entities.map(GeographyEntityToDomain.mapper())

      if (includeMetadata) {
        const metadata = await getGeographyMetadata(geographies)
        return geographies.map(geography => ({
          ...geography,
          geography_metadata: metadata.get(geography.geography_id) ?? null
        }))
      }

      return geographies
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public writeGeographies = async (geographies: GeographyDomainCreateModel[]): Promise<GeographyDomainModel[]> => {
    if (geographies.length > 0) {
      const { connect } = this
      try {
        const connection = await connect('rw')

        const { raw: entities = [] }: InsertReturning<GeographyEntity> = await connection
          .getRepository(GeographyEntity)
          .createQueryBuilder()
          .insert()
          .values(geographies.map(GeographyDomainToEntityCreate.mapper()))
          .returning('*')
          .execute()
        return entities.map(GeographyEntityToDomain.mapper())
      } catch (error) {
        throw RepositoryError(error)
      }
    }
    return []
  }

  public writeGeographiesMetadata = async (
    metadata: GeographyMetadataDomainCreateModel[]
  ): Promise<GeographyMetadataDomainModel[]> => {
    if (metadata.length > 0) {
      const { connect } = this

      try {
        const connection = await connect('rw')
        const { raw: entities = [] }: InsertReturning<GeographyMetadataEntity> = await connection
          .getRepository(GeographyMetadataEntity)
          .createQueryBuilder()
          .insert()
          .values(metadata.map(GeographyMetadataDomainToEntityCreate.mapper()))
          .onConflict('("geography_id") DO UPDATE SET "geography_metadata" = EXCLUDED."geography_metadata"')
          .returning('*')
          .execute()
        return entities.map(GeographyMetadataEntityToDomain.mapper())
      } catch (error) {
        throw RepositoryError(error)
      }
    }
    return []
  }

  constructor() {
    super('geographies', { entities: [GeographyEntity, GeographyMetadataEntity], migrations })
  }
}

export const GeographyRepository = new GeographyReadWriteRepository()
