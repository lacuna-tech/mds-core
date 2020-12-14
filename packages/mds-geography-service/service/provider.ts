import { ServiceProvider, ProcessController, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import logger from '@mds-core/mds-logger'
import { NotFoundError } from '@mds-core/mds-utils'
import { GeographyService } from '../@types'
import { GeographyRepository } from '../repository'
import {
  validateGeographyDomainCreateModel,
  validateGeographyMetadataDomainCreateModel,
  validateReadPublishedGeographiesOptions
} from './validators'

export const GeographyServiceProvider: ServiceProvider<GeographyService> & ProcessController = {
  start: GeographyRepository.initialize,
  stop: GeographyRepository.shutdown,

  getGeographies: async options => {
    try {
      const geographies = await GeographyRepository.getGeographies(validateReadPublishedGeographiesOptions(options))
      return ServiceResult(geographies)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Geographies', error)
      logger.error(exception, error)
      return exception
    }
  },

  getGeographiesWithMetadata: async options => {
    try {
      const geographies = await GeographyRepository.getGeographiesWithMetadata(
        validateReadPublishedGeographiesOptions(options)
      )
      return ServiceResult(geographies)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Geographies with Metadata', error)
      logger.error(exception, error)
      return exception
    }
  },

  getGeography: async geography_id => {
    try {
      const geography = await GeographyRepository.getGeography(geography_id)
      if (geography === undefined) {
        throw new NotFoundError(`${geography_id} not found`)
      }
      return ServiceResult(geography)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Getting Geography', error)
      logger.error(exception, error)
      return exception
    }
  },

  getGeographyWithMetadata: async geography_id => {
    try {
      const geography = await GeographyRepository.getGeographyWithMetadata(geography_id)
      if (geography === undefined) {
        throw new NotFoundError(`${geography_id} not found`)
      }
      return ServiceResult(geography)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Getting Geography ${geography_id} with Metadata`, error)
      logger.error(exception, error)
      return exception
    }
  },

  writeGeographies: async models => {
    try {
      const geographies = await GeographyRepository.writeGeographies(models.map(validateGeographyDomainCreateModel))
      return ServiceResult(geographies)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Writing Geographies', error)
      logger.error(exception, error)
      return exception
    }
  },

  writeGeographiesMetadata: async models => {
    try {
      const metadata = await GeographyRepository.writeGeographiesMetadata(
        models.map(validateGeographyMetadataDomainCreateModel)
      )
      return ServiceResult(metadata)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Writing Geographies Metadata', error)
      logger.error(exception, error)
      return exception
    }
  }
}
