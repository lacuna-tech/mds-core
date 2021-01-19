import { getManager } from 'typeorm'

import { InsertReturning, RepositoryError, ReadWriteRepository } from '@mds-core/mds-repository'
import { isDefined, NotFoundError, now } from '@mds-core/mds-utils'
import { UUID } from '@mds-core/mds-types'
import {
  ComplianceSnapshotDomainModel,
  GetComplianceSnapshotsByTimeIntervalOptions,
  GetComplianceSnapshotOptions,
  GetComplianceViolationPeriodsOptions,
  ComplianceViolationPeriodEntityModel
} from '../@types'
import { ComplianceSnapshotEntityToDomain, ComplianceSnapshotDomainToEntityCreate } from './mappers'
import { ComplianceSnapshotEntity } from './entities/compliance-snapshot-entity'
import migrations from './migrations'

class ComplianceReadWriteRepository extends ReadWriteRepository {
  public getComplianceSnapshot = async (
    options: GetComplianceSnapshotOptions
  ): Promise<ComplianceSnapshotDomainModel> => {
    const isComplianceIdOption = (option: unknown): option is { compliance_snapshot_id: UUID } =>
      (option as any).compliance_snapshot_id

    const { connect } = this
    try {
      const connection = await connect('ro')
      if (isComplianceIdOption(options)) {
        const { compliance_snapshot_id } = options
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
      const { provider_id, policy_id, compliance_as_of = now() } = options
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

  public getComplianceViolationPeriods = async (
    options: GetComplianceViolationPeriodsOptions
  ): Promise<ComplianceViolationPeriodEntityModel[]> => {
    const { start_time, end_time = now(), policy_ids, provider_ids } = options
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entityManager = getManager(connection.name)
      const mainQuery = `select
      provider_id, policy_id,
      start_time,
      end_time,
      LEAD(end_time, 1, NULL) OVER (partition by provider_id, policy_id order by start_time) as real_end_time,
      compliance_snapshot_ids,
      sum_total_violations
      from (
        select
          provider_id, policy_id,
          min(compliance_as_of) as start_time,
          max(compliance_as_of) as end_time,
          array_agg(compliance_snapshot_id) as compliance_snapshot_ids,
          sum(total_violations) as sum_total_violations
          from (
            select
            provider_id, policy_id,
            max(group_number) OVER (partition BY provider_id, policy_id order by compliance_as_of) as group_number,
            compliance_as_of, compliance_snapshot_id, total_violations
            from (
                select
                provider_id, policy_id, compliance_as_of, compliance_snapshot_id, total_violations,
                CASE WHEN
                LAG(total_violations) OVER (partition BY provider_id, policy_id order by compliance_as_of) > 0
                  AND total_violations > 0
                  THEN NULL
                ELSE
                  row_number() OVER (partition BY provider_id, policy_id order by compliance_as_of)
                END group_number
                from ${entityManager.getRepository(ComplianceSnapshotEntity).metadata.tableName}
                where
                  compliance_as_of >= $1
                  and compliance_as_of <= $2
                  and policy_id in ($3)
                  and provider_id in ($4)
                order by provider_id, policy_id, compliance_as_of
            ) s1
          ) s2
          group by provider_id, policy_id, group_number
        ) s3; `
      return await entityManager.query(mainQuery, [start_time, end_time, policy_ids.join(','), provider_ids.join(',')])
    } catch (error) {
      // ${getManager().getRepository(ComplianceSnapshotEntity).metadata.tableName}
      throw RepositoryError(error)
    }
  }

  constructor() {
    super('compliance', {
      entities: [ComplianceSnapshotEntity],
      migrations
    })
  }
}

export const ComplianceRepository = new ComplianceReadWriteRepository()
