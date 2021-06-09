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

import { ServiceProvider, ProcessController, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import { IngestService } from '../@types'
import { GetVehicleEventsFilterParams, IngestRepository } from '../repository'
import logger from '@mds-core/mds-logger'

export const IngestServiceProvider: ServiceProvider<IngestService> & ProcessController = {
  start: IngestRepository.initialize,
  stop: IngestRepository.shutdown,
  name: async () => ServiceResult('mds-ingest-service'),
  getEvents: async (params: GetVehicleEventsFilterParams) => {
    try {
      const events = await IngestRepository.getEvents(params)
      return ServiceResult(events)
    } catch (error) {
      const exception = ServiceException(`Error in getEvents `, error)
      logger.error('getEvents exception', { exception, error })
      return exception
    }
  }
}
