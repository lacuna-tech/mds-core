import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { NotFoundError } from '@mds-core/mds-utils'
import { ComplianceSnapshotDomainModel } from '../@types'
import { ComplianceSnapshotEntityToDomain, ComplianceSnapshotDomainToEntityCreate } from './mappers'
import { ComplianceSnapshotEntity, ComplianceSnapshotEntityModel } from './entities/ComplianceSnapshot-entity'
import migrations from './migrations'

class ComplianceSnapshotReadWriteRepository extends ReadWriteRepository {
  public getComplianceSnapshot = async (name: string): Promise<ComplianceSnapshotDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entity = await connection.getRepository(ComplianceSnapshotEntity).findOne({
        where: {
          name
        }
      })
      if (!entity) {
        throw new NotFoundError(`ComplianceSnapshot ${name} not found`)
      }
      return ComplianceSnapshotEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public updateComplianceSnapshot = async (update: ComplianceSnapshotDomainModel): Promise<ComplianceSnapshotDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { name } = update
      const currentComplianceSnapshot = await connection.getRepository(ComplianceSnapshotEntity).findOne({ where: { name } })
      if (!currentComplianceSnapshot) {
        throw new NotFoundError(`ComplianceSnapshot ${name} not found`)
      }
      const {
        raw: [updated]
      } = await connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .update()
        .set({
          ...currentComplianceSnapshot,
          ...ComplianceSnapshotDomainToEntityCreate.map(update)
        })
        .where('name = :name', { name })
        .returning('*')
        .execute()
      return ComplianceSnapshotEntityToDomain.map(updated)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public getComplianceSnapshots = async (): Promise<ComplianceSnapshotDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entities = await connection.getRepository(ComplianceSnapshotEntity).find()
      return entities.map(ComplianceSnapshotEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createComplianceSnapshot = async (ComplianceSnapshot: ComplianceSnapshotDomainModel): Promise<ComplianceSnapshotDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const {
        raw: [entity]
      }: InsertReturning<ComplianceSnapshotEntity> = await connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .insert()
        .values([ComplianceSnapshotDomainToEntityCreate.map(ComplianceSnapshot)])
        .returning('*')
        .execute()
      return ComplianceSnapshotEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createComplianceSnapshots = async (ComplianceSnapshots: ComplianceSnapshotDomainModel[]): Promise<ComplianceSnapshotDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { raw: entities }: InsertReturning<ComplianceSnapshotEntity> = await connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .insert()
        .values(ComplianceSnapshots.map(ComplianceSnapshotDomainToEntityCreate.mapper()))
        .returning('*')
        .execute()
      return entities.map(ComplianceSnapshotEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public deleteComplianceSnapshot = async (name: ComplianceSnapshotEntityModel['name']): Promise<ComplianceSnapshotEntityModel['name']> => {
    const { connect, getComplianceSnapshot } = this
    // Try to read ComplianceSnapshot first, if not 404
    await getComplianceSnapshot(name)
    try {
      const connection = await connect('rw')
      await connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .delete()
        .where('name = :name', { name })
        .returning('*')
        .execute()
      return name
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  constructor() {
    super('ComplianceSnapshots', {
      entities: [ComplianceSnapshotEntity],
      migrations
    })
  }
}

export const ComplianceSnapshotRepository = new ComplianceSnapshotReadWriteRepository()
