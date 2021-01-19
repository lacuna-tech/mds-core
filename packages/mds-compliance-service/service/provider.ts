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
  ComplianceSnapshotDomainModel,
  ComplianceViolationPeriodEntityModel,
  ComplianceViolationPeriodDomainModel
} from '../@types'
import { ComplianceRepository } from '../repository'
import {
  ValidateComplianceSnapshotDomainModel,
  ValidateGetComplianceSnapshotsByTimeIntervalOptions
} from './validators'
import { ComplianceViolationPeriodEntityToDomainCreate } from '../repository/mappers'

/*
async function convertComplianceSnapshotsArrayToComplianceViolationPeriod(
  snapshots: ComplianceSnapshotDomainModel[]
): Promise<ComplianceViolationPeriod> {
  const lastSnapshot = snapshots[snapshots.length - 1]
  const hasTerminatingSnapshot = lastSnapshot.total_violations === 0
  const end_time = hasTerminatingSnapshot ? lastSnapshot.compliance_as_of : null
  const violatingSnapshots = hasTerminatingSnapshot ? snapshots.slice(0, snapshots.length - 1) : snapshots
  return {
    start_time: snapshots[0].compliance_as_of,
    end_time,
    snapshots_uri: `/compliance_snapshot_ids?token=${encodeToken(
      violatingSnapshots.map(s => s.compliance_snapshot_id)
    )}`
  }
}
*/

// The keys take the format `${provider_id},${policy_id}`
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
      const { start_time, end_time, provider_ids, policy_ids } = options

      /*
      const complianceSnapshots = await ComplianceRepository.getComplianceSnapshotsByTimeInterval({
        start_time,
        end_time,
        provider_ids,
        policy_ids
      })

      const complianceAggregateMap: ComplianceAggregateMap = {}
      */

      /**
       * Iterate through all compliance snapshots. For each policy-provider pair, build up arrays of
       * contiguous compliance snapshots that contain violations. End the array when a compliance snapshot
       * is encountered that has no violations. E.g. if for Jump and policy A, there are snapshots B, C, D, E,
       * and F, and B, C, E and F contain violations, B and C get grouped together and eventually put into the
       * same instance of a ComplianceViolationPeriod, and E and F get grouped together. D is basically ignored.
       * Add the first compliance snapshot that has zero violations. The timestamp on that snapshot is when the
       * violation period ended. If the snapshot have violations till the end of the query period, the end time
       * of the violation period is unknown, and therefore set to null.
       */
      /*
      complianceSnapshots.forEach(complianceSnapshot => {
        const { provider_id } = complianceSnapshot
        const { policy_id } = complianceSnapshot.policy
        const key = `${provider_id},${policy_id}`
        if (!isDefined(complianceAggregateMap[key])) {
          complianceAggregateMap[key] = {
            complianceSnapshotViolationGroupings: [],
            complianceSnapshots: null
          }
        }

        const mapEntry = complianceAggregateMap[key]
        if (complianceSnapshot.total_violations > 0) {
          if (mapEntry.complianceSnapshots === null) {
            mapEntry.complianceSnapshots = [complianceSnapshot]
          } else {
            mapEntry.complianceSnapshots.push(complianceSnapshot)
          }
        } else if (mapEntry.complianceSnapshots !== null) {
          mapEntry.complianceSnapshots.push(complianceSnapshot)
          mapEntry.complianceSnapshotViolationGroupings.push(mapEntry.complianceSnapshots)
          // Reset the current array of violating snapshots to null in preparation for starting
          //  a new grouping of violating snapshots
          mapEntry.complianceSnapshots = null
        }
      })

      Object.keys(complianceAggregateMap).forEach(key => {
        const mapEntry = complianceAggregateMap[key]
        if (mapEntry.complianceSnapshots !== null) {
          mapEntry.complianceSnapshotViolationGroupings.push(mapEntry.complianceSnapshots)
        }
      })

      const results: ComplianceAggregate[] = await Promise.all(
        Object.keys(complianceAggregateMap).map(async key => {
          const { 0: provider_id, 1: policy_id } = key.split(',')
          const violationPeriods: ComplianceViolationPeriod[] = await Promise.all(
            complianceAggregateMap[key].complianceSnapshotViolationGroupings.map(complianceGroup => {
              return convertComplianceSnapshotsArrayToComplianceViolationPeriod(complianceGroup)
            })
          )

          return {
            provider_id,
            policy_id,
            provider_name: providerName(provider_id),
            violation_periods: violationPeriods
          }
        })
      )
      */
      const violationPeriodEntities = await ComplianceRepository.getComplianceViolationPeriods(options)
      const complianceAggregateMap: ComplianceAggregateMap = {}
      violationPeriodEntities.forEach(violationPeriodEntity => {
        const { provider_id, policy_id } = violationPeriodEntity
        const key = `${provider_id},${policy_id}`

        if (!isDefined(complianceAggregateMap[key])) {
          complianceAggregateMap[key] = []
        }
        if (violationPeriodEntity.sum_total_violations > 0) {
          complianceAggregateMap[key].push(ComplianceViolationPeriodEntityToDomainCreate.map(violationPeriodEntity))
        }
      })

      const results: ComplianceAggregateDomainModel[] = Object.keys(complianceAggregateMap).map(key => {
        const { 0: provider_id, 1: policy_id } = key.split(',')

        return {
          provider_id,
          policy_id,
          provider_name: providerName(provider_id),
          violation_periods: complianceAggregateMap[key]
        }
      })

      return ServiceResult(results)
    } catch (error) {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  }
}
