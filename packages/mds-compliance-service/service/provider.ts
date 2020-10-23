import logger from '@mds-core/mds-logger'
import { ServiceResult, ServiceException, ServiceProvider, ProcessController } from '@mds-core/mds-service-helpers'
import { ComplianceSnapshotService } from '../@types'
import { ComplianceSnapshotRepository } from '../repository'
import { ValidateComplianceSnapshotDomainModel } from './validators'

export const ComplianceSnapshotServiceProvider: ServiceProvider<ComplianceSnapshotService> & ProcessController = {
  start: ComplianceSnapshotRepository.initialize,
  stop: ComplianceSnapshotRepository.shutdown,
  createComplianceSnapshot: async ComplianceSnapshot => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.createComplianceSnapshot(ValidateComplianceSnapshotDomainModel(ComplianceSnapshot)))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshot', error)
      logger.error(exception, error)
      return exception
    }
  },
  createComplianceSnapshots: async ComplianceSnapshots => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.createComplianceSnapshots(ComplianceSnapshots.map(ValidateComplianceSnapshotDomainModel)))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating ComplianceSnapshots', error)
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceSnapshot: async name => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.getComplianceSnapshot(name))
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting ComplianceSnapshot: ${name}`, error)
      logger.error(exception, error)
      return exception
    }
  },
  getComplianceSnapshots: async () => {
    try {
      return ServiceResult(await ComplianceSnapshotRepository.getComplianceSnapshots())
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
