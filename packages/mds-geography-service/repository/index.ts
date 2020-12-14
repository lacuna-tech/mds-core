import { InsertReturning, ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import {
  GeographyDomainCreateModel,
  GeographyDomainModel,
  GeographyMetadataDomainCreateModel,
  GeographyMetadataDomainModel,
  GeographyWithMetadataDomainModel,
  FindGeographiesOptions
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
  protected attachMetadata = async (
    geographies: GeographyDomainModel[]
  ): Promise<GeographyWithMetadataDomainModel[]> => {
    if (geographies.length > 0) {
      const { connect } = this
      try {
        const connection = await connect('ro')
        const metadata = new Map(
          (
            await connection
              .getRepository(GeographyMetadataEntity)
              .createQueryBuilder('geography_metadata')
              .where('geography_id IN (:...geography_ids)', {
                geography_ids: geographies.map(geography => geography.geography_id)
              })
              .getMany()
          ).map(entity => [entity.geography_id, entity.geography_metadata])
        )
        return geographies.map(geography => ({
          ...geography,
          geography_metadata: metadata.get(geography.geography_id) ?? null
        }))
      } catch (error) /* istanbul ignore next */ {
        throw RepositoryError(error)
      }
    }
    return []
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

  public getGeographies = async ({ status }: FindGeographiesOptions = {}): Promise<GeographyDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')

      const query = connection.getRepository(GeographyEntity).createQueryBuilder('geographies')

      if (status) {
        query.where(`"geographies"."publish_date" ${status === 'draft' ? 'IS NULL' : 'IS NOT NULL'}`)
      }

      const entities = await query.getMany()

      return entities.map(GeographyEntityToDomain.mapper())
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public getGeographiesWithMetadata = async (
    options: FindGeographiesOptions = {}
  ): Promise<GeographyWithMetadataDomainModel[]> => {
    const { getGeographies, attachMetadata } = this
    const geographies = await getGeographies(options)
    return attachMetadata(geographies)
  }

  public getGeography = async (
    geography_id: GeographyDomainModel['geography_id']
  ): Promise<GeographyDomainModel | undefined> => {
    const { connect } = this
    try {
      const connection = await connect('ro')

      const geography = await connection
        .getRepository(GeographyEntity)
        .createQueryBuilder('geographies')
        .where('"geography_id" = :geography_id', { geography_id })
        .getOne()

      return geography && GeographyEntityToDomain.map(geography)
    } catch (error) /* istanbul ignore next */ {
      throw RepositoryError(error)
    }
  }

  public getGeographyWithMetadata = async (
    geography_id: GeographyDomainModel['geography_id']
  ): Promise<GeographyWithMetadataDomainModel | undefined> => {
    const { getGeography, attachMetadata } = this
    const geography = await getGeography(geography_id)
    if (geography) {
      const [result] = await attachMetadata([geography])
      return result
    }
  }

  constructor() {
    super('geographies', { entities: [GeographyEntity, GeographyMetadataEntity], migrations })
  }
}

export const GeographyRepository = new GeographyReadWriteRepository()
