import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { isDefined } from '@mds-core/mds-utils'
import { providerName } from '@mds-core/mds-providers'
import {
  ComplianceService,
  GetComplianceSnapshotsByTimeIntervalOptions,
  GetComplianceViolationPeriodsOptions,
  ComplianceAggregateDomainModel,
  ComplianceViolationPeriodDomainModel
} from '../@types'
import { ComplianceRepository } from '../repository'
import {
  ValidateComplianceSnapshotDomainModel,
  ValidateGetComplianceSnapshotsByTimeIntervalOptions
} from './validators'
import { ComplianceViolationPeriodEntityToDomainCreate } from '../repository/mappers'

interface ComplianceAggregateMap {
  [k: string]: ComplianceViolationPeriodDomainModel[]
}

export const ComplianceServiceProvider: ServiceProvider<ComplianceService> & ProcessController = {
  start: ComplianceRepository.initialize,
  stop: ComplianceRepository.shutdown,
  createComplianceSnapshot: async complianceSnapshot => {
    try {
      return ServiceResult(
        await ComplianceRepository.createComplianceSnapshot(ValidateComplianceSnapshotDomainModel(complianceSnapshot))
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshot', error)
      logger.error(exception, error)
      return exception
    }
  },
  createComplianceSnapshots: async complianceSnapshots => {
    try {
      return ServiceResult(
        await ComplianceRepository.createComplianceSnapshots(
          complianceSnapshots.map(ValidateComplianceSnapshotDomainModel)
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceSnapshot: async options => {
    try {
      return ServiceResult(await ComplianceRepository.getComplianceSnapshot(options))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(
        `Error Getting ComplianceSnapshot with these options: ${JSON.stringify(options)}`,
        error
      )
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceSnapshotsByTimeInterval: async (options: GetComplianceSnapshotsByTimeIntervalOptions) => {
    try {
      return ServiceResult(
        await ComplianceRepository.getComplianceSnapshotsByTimeInterval(
          ValidateGetComplianceSnapshotsByTimeIntervalOptions(options)
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceSnapshotsByIDs: async (ids: UUID[]) => {
    try {
      return ServiceResult(await ComplianceRepository.getComplianceSnapshotsByIDs(ids))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  },

  getComplianceViolationPeriods: async (options: GetComplianceViolationPeriodsOptions) => {
    try {
      const violationPeriodEntities = await ComplianceRepository.getComplianceViolationPeriods(options)
      const complianceAggregateMap = violationPeriodEntities.reduce(
        (acc: ComplianceAggregateMap, violationPeriodEntity) => {
          const { provider_id, policy_id } = violationPeriodEntity
          const key = `${provider_id}:${policy_id}`

          if (!isDefined(acc[key])) {
            // eslint-disable-next-line no-param-reassign
            acc[key] = []
          }
          if (violationPeriodEntity.sum_total_violations > 0) {
            acc[key].push(ComplianceViolationPeriodEntityToDomainCreate.map(violationPeriodEntity))
          }
          return acc
        },
        {}
      )

      const results: ComplianceAggregateDomainModel[] = Object.keys(complianceAggregateMap).map(key => {
        const { 0: provider_id, 1: policy_id } = key.split(':')

        return {
          provider_id,
          policy_id,
          provider_name: providerName(provider_id),
          violation_periods: complianceAggregateMap[key]
        }
      })

      return ServiceResult(results)
    } catch (error) {
      const exception = ServiceException('Error Getting Compliance Violation Periods', error)
      logger.error(exception, error)
      return exception
    }
  }
}
