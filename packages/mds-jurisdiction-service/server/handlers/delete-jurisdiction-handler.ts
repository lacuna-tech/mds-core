/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { UUID, Jurisdiction } from '@mds-core/mds-types'
import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import { NotFoundError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { AsJurisdiction } from './utils'
import { JurisdictionRepository } from '../repository'

export const DeleteJurisdictionHandler = async (
  jurisdiction_id: UUID
): Promise<ServiceResponse<Pick<Jurisdiction, 'jurisdiction_id'>, NotFoundError>> => {
  try {
    const entity = await JurisdictionRepository.readJurisdiction(jurisdiction_id)
    if (entity) {
      const current = AsJurisdiction()(entity)
      if (current) {
        // "Soft" delete the jursidiction by updating it with a new version containing a null geography_id
        await JurisdictionRepository.updateJurisdiction(jurisdiction_id, {
          ...entity,
          versions: [
            {
              agency_name: current.agency_name,
              geography_id: null,
              timestamp: Date.now()
            },
            ...entity.versions
          ].sort((a, b) => b.timestamp - a.timestamp)
        })
        return ServiceResult({ jurisdiction_id })
      }
    }
    return ServiceError(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id }))
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Deleting Jurisdiction', error)
    return ServiceError(error)
  }
}
