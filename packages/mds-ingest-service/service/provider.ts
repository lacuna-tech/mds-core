/**
 * Copyright 2020 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import logger from '@mds-core/mds-logger'
import { ProcessController, ServiceException, ServiceProvider, ServiceResult } from '@mds-core/mds-service-helpers'
import { UUID } from '@mds-core/mds-types'
import { EventAnnotationDomainCreateModel, IngestService } from '../@types'
import { IngestRepository } from '../repository'
import {
  validateEventAnnotationDomainCreateModels,
  validateGetVehicleEventsFilterParams,
  validateUUIDs
} from './validators'

export const IngestServiceProvider: ServiceProvider<IngestService> & ProcessController = {
  start: IngestRepository.initialize,
  stop: IngestRepository.shutdown,
  name: async () => ServiceResult('mds-ingest-service'),
  getEventsUsingOptions: async params => {
    try {
      return ServiceResult(await IngestRepository.getEventsUsingOptions(validateGetVehicleEventsFilterParams(params)))
    } catch (error) {
      const exception = ServiceException(`Error in getEvents `, error)
      logger.error('getEvents exception', { exception, error })
      return exception
    }
  },
  getEventsUsingCursor: async cursor => {
    try {
      return ServiceResult(await IngestRepository.getEventsUsingCursor(cursor))
    } catch (error) {
      const exception = ServiceException(`Error in getEvents `, error)
      logger.error('getEvents exception', { exception, error })
      return exception
    }
  },
  getDevices: async (ids: UUID[]) => {
    try {
      return ServiceResult(await IngestRepository.getDevices(validateUUIDs(ids)))
    } catch (error) {
      const exception = ServiceException(`Error in getDevices `, error)
      logger.error('getDevices exception', { exception, error })
      return exception
    }
  },
  writeEventAnnotations: async (eventAnnotations: EventAnnotationDomainCreateModel[]) => {
    try {
      return ServiceResult(
        await IngestRepository.createEventAnnotations(validateEventAnnotationDomainCreateModels(eventAnnotations))
      )
    } catch (error) {
      const exception = ServiceException(`Error in writeEventAnnotations `, error)
      logger.error('writeEventAnnotations exception', { exception, error })
      return exception
    }
  }
}
