import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { ComplianceService, GetComplianceSnapshotsByTimeIntervalOptions } from '../@types'
import { ComplianceRepository } from '../repository'
import {
  ValidateComplianceSnapshotDomainModel,
  ValidateGetComplianceSnapshotsByTimeIntervalOptions
} from './validators'

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
  }
}
