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

import { UUID } from '@mds-core/mds-types'
import { ServiceResponse, ServiceError, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import logger from '@mds-core/mds-logger'
import { UpdateJurisdictionType, JurisdictionDomainModel } from '../../@types'
import { JurisdictionRepository } from '../repository'
import { JurisdictionEntityToDomain } from '../repository/mappers'

export const UpdateJurisdictionHandler = async (
  jurisdiction_id: UUID,
  update: UpdateJurisdictionType
): Promise<ServiceResponse<JurisdictionDomainModel>> => {
  if (update.jurisdiction_id && update.jurisdiction_id !== jurisdiction_id) {
    return ServiceError({
      type: 'ConflictError',
      message: 'Error Updating Jurisdiction',
      details: `Invalid jurisdiction_id ${update.jurisdiction_id}. Must match ${jurisdiction_id}.`
    })
  }
  try {
    const entity = await JurisdictionRepository.readJurisdiction(jurisdiction_id)
    if (entity) {
      const jurisdiction = JurisdictionEntityToDomain.map(entity)
      if (jurisdiction) {
        const timestamp = update.timestamp ?? Date.now()
        if (timestamp <= jurisdiction.timestamp) {
          return ServiceError({
            type: 'ValidationError',
            message: 'Error Updating Jurisdiction',
            details: `Invalid timestamp ${timestamp}. Must be greater than ${jurisdiction.timestamp}.`
          })
        }
        const updated = await JurisdictionRepository.updateJurisdiction(jurisdiction_id, {
          ...entity,
          agency_key: update.agency_key ?? jurisdiction.agency_key,
          versions:
            (update.agency_name && update.agency_name !== jurisdiction.agency_name) ||
            (update.geography_id && update.geography_id !== jurisdiction.geography_id)
              ? [
                  {
                    agency_name: update.agency_name ?? jurisdiction.agency_name,
                    geography_id: update.geography_id ?? jurisdiction.geography_id,
                    timestamp
                  },
                  ...entity.versions
                ].sort((a, b) => b.timestamp - a.timestamp)
              : entity.versions
        })
        return ServiceResult(JurisdictionEntityToDomain.map(updated))
      }
    }
    return ServiceError({
      type: 'NotFoundError',
      message: 'Error Updating Jurisdiction',
      details: `Jurisdiction ${jurisdiction_id} Not Found`
    })
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Updating Jurisdiction', error)
    return ServiceException('Error Updating Jurisdiction', error)
  }
}
