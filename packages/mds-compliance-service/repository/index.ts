import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { isDefined, NotFoundError, now } from '@mds-core/mds-utils'
import { UUID } from '@mds-core/mds-types'
import {
  ComplianceSnapshotDomainModel,
  GetComplianceSnapshotsByTimeIntervalOptions,
  GetComplianceSnapshotOptions
} from '../@types'
import { ComplianceSnapshotEntityToDomain, ComplianceSnapshotDomainToEntityCreate } from './mappers'
import { ComplianceSnapshotEntity, ComplianceSnapshotEntityModel } from './entities/compliance-snapshot-entity'
import migrations from './migrations'

class ComplianceSnapshotReadWriteRepository extends ReadWriteRepository {
  public getComplianceSnapshot = async ({
    compliance_snapshot_id,
    provider_id,
    policy_id,
    compliance_as_of = now()
  }: GetComplianceSnapshotOptions): Promise<ComplianceSnapshotDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      if (isDefined(compliance_snapshot_id)) {
        const entity = await connection.getRepository(ComplianceSnapshotEntity).findOne({
          where: {
            compliance_snapshot_id
          }
        })
        if (!entity) {
          throw new NotFoundError(`ComplianceSnapshot ${compliance_snapshot_id} not found`)
        }
        return ComplianceSnapshotEntityToDomain.map(entity)
      }
      if (!isDefined(provider_id) || !isDefined(policy_id)) {
        throw RepositoryError('provider_id and policy_id must be given if compliance_snapshot_id is not given')
      }

      const query = connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .where(`provider_id = '${provider_id}'`)
        .andWhere(`policy_id = '${policy_id}'`)
        .andWhere(`compliance_as_of >= ${compliance_as_of}`)
        .orderBy('compliance_as_of')

      const entity = await query.getOne()
      if (!entity) {
        throw new NotFoundError(
          `ComplianceSnapshot not found with params ${JSON.stringify({
            policy_id,
            provider_id,
            compliance_as_of
          })} not found`
        )
      }
      return ComplianceSnapshotEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public getComplianceSnapshotsByTimeInterval = async ({
    start_time,
    end_time = now(),
    provider_ids,
    policy_ids
  }: GetComplianceSnapshotsByTimeIntervalOptions): Promise<ComplianceSnapshotDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const query = connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .where(`compliance_as_of >= ${start_time}`)
        .andWhere(`compliance_as_of <= ${end_time}`)
      if (isDefined(provider_ids)) {
        query.andWhere('provider_id IN (:...provider_ids)', { provider_ids })
      }
      if (isDefined(policy_ids)) {
        query.andWhere('policy_id IN (:...policy_ids)', { policy_ids })
      }

      query.orderBy('compliance_as_of')
      const entities = await query.getMany()
      return entities.map(ComplianceSnapshotEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public getComplianceSnapshotsByIDs = async (ids: UUID[]): Promise<ComplianceSnapshotDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entities = connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .where('compliance_snapshot_id IN (:...ids)', { ids })
        .getMany()
      return (await entities).map(ComplianceSnapshotEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createComplianceSnapshot = async (
    complianceSnapshot: ComplianceSnapshotDomainModel
  ): Promise<ComplianceSnapshotDomainModel> => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const {
        raw: [entity]
      }: InsertReturning<ComplianceSnapshotEntity> = await connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .insert()
        .values([ComplianceSnapshotDomainToEntityCreate.map(complianceSnapshot)])
        .returning('*')
        .execute()
      return ComplianceSnapshotEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createComplianceSnapshots = async (
    ComplianceSnapshots: ComplianceSnapshotDomainModel[]
  ): Promise<ComplianceSnapshotDomainModel[]> => {
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

  public deleteComplianceSnapshot = async (
    compliance_snapshot_id: ComplianceSnapshotEntityModel['compliance_snapshot_id']
  ): Promise<ComplianceSnapshotEntityModel['compliance_snapshot_id']> => {
    const { connect, getComplianceSnapshot } = this
    // Try to read ComplianceSnapshot first, if not 404
    await getComplianceSnapshot({ compliance_snapshot_id })
    try {
      const connection = await connect('rw')
      await connection
        .getRepository(ComplianceSnapshotEntity)
        .createQueryBuilder()
        .delete()
        .where('compliance_snapshot_id = :compliance_snapshot_id', { compliance_snapshot_id })
        .returning('*')
        .execute()
      return compliance_snapshot_id
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
