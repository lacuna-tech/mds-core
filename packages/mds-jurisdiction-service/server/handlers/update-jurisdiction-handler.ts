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
import { ServiceResponse, ServiceError, ServiceResult } from '@mds-core/mds-service-helpers'
import { ValidationError, NotFoundError, ServerError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { UpdateJurisdictionType, JurisdictionDomainModel } from '../../@types'
import { JurisdictionModelMapper } from '../repository/model-mappers'
import { JurisdictionRepository } from '../repository'

export const UpdateJurisdictionHandler = async (
  jurisdiction_id: UUID,
  update: UpdateJurisdictionType
): Promise<ServiceResponse<JurisdictionDomainModel, ValidationError | NotFoundError>> => {
  if (update.jurisdiction_id && update.jurisdiction_id !== jurisdiction_id) {
    return ServiceError(new ValidationError('Invalid jurisdiction_id for update'))
  }
  try {
    const entity = await JurisdictionRepository.readJurisdiction(jurisdiction_id)
    if (entity) {
      const versions = JurisdictionModelMapper.toDomain({ effective: Date.now() }).map([entity])
      if (versions.length) {
        const [current] = versions
        const timestamp = update.timestamp ?? Date.now()
        if (timestamp <= current.timestamp) {
          return ServiceError(new ValidationError('Invalid timestamp for update'))
        }
        const updated = await JurisdictionRepository.updateJurisdiction(jurisdiction_id, {
          ...entity,
          agency_key: update.agency_key ?? current.agency_key,
          versions:
            (update.agency_name && update.agency_name !== current.agency_name) ||
            (update.geography_id && update.geography_id !== current.geography_id)
              ? [
                  {
                    agency_name: update.agency_name ?? current.agency_name,
                    geography_id: update.geography_id ?? current.geography_id,
                    timestamp
                  },
                  ...entity.versions
                ].sort((a, b) => b.timestamp - a.timestamp)
              : entity.versions
        })
        const [jurisdiction] = JurisdictionModelMapper.toDomain({ effective: timestamp }).map([updated])
        return jurisdiction
          ? ServiceResult(jurisdiction)
          : ServiceError(new ServerError('Unexpected error during update'))
      }
    }
    return ServiceError(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id }))
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Updating Jurisdiction', error)
    return ServiceError(error)
  }
}
