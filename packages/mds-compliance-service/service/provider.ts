import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { ComplianceSnapshotService, GetComplianceSnapshotsByTimeIntervalOptions } from '../@types'
import { ComplianceSnapshotRepository } from '../repository'
import { ValidateComplianceSnapshotDomainModel } from './validators'

export const ComplianceSnapshotServiceProvider: ServiceProvider<ComplianceSnapshotService> & ProcessController = {
  start: ComplianceSnapshotRepository.initialize,
  stop: ComplianceSnapshotRepository.shutdown,
  createComplianceSnapshot: async ComplianceSnapshot => {
    try {
      return ServiceResult(
        await ComplianceSnapshotRepository.createComplianceSnapshot(
          ValidateComplianceSnapshotDomainModel(ComplianceSnapshot)
        )
      )
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshot', error)
      logger.error(exception, error)
      return exception
    }
  },
  createComplianceSnapshots: async ComplianceSnapshots => {
    try {
      return ServiceResult(
        await ComplianceSnapshotRepository.createComplianceSnapshots(
          ComplianceSnapshots.map(ValidateComplianceSnapshotDomainModel)
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
      return ServiceResult(await ComplianceSnapshotRepository.getComplianceSnapshot(options))
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
      return ServiceResult(await ComplianceSnapshotRepository.getComplianceSnapshotsByTimeInterval(options))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceSnapshotsByIDs: async (ids: UUID[]) => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.getComplianceSnapshotsByIDs(ids))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  },
  updateComplianceSnapshot: async ComplianceSnapshot => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.updateComplianceSnapshot(ComplianceSnapshot))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Updating ComplianceSnapshot', error)
      logger.error(exception, error)
      return exception
    }
  },
  deleteComplianceSnapshot: async name => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.deleteComplianceSnapshot(name))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Deleting ComplianceSnapshot: ${name}`, error)
      logger.error(exception, error)
      return exception
    }
  }
}
