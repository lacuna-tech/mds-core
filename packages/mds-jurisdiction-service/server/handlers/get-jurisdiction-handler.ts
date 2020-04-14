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
import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import { NotFoundError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { GetJurisdictionsOptions, JurisdictionDomainModel } from '../../@types'
import { JurisdictionModelMapper } from '../repository/model-mappers'
import { JurisdictionRepository } from '../repository'

export const GetJurisdictionHandler = async (
  jurisdiction_id: UUID,
  { effective = Date.now() }: Partial<GetJurisdictionsOptions> = {}
): Promise<ServiceResponse<JurisdictionDomainModel, NotFoundError>> => {
  try {
    const entity = await JurisdictionRepository.readJurisdiction(jurisdiction_id)
    if (entity) {
      const versions = JurisdictionModelMapper.toDomain({ effective }).map([entity])
      if (versions.length) {
        const [jurisdiction] = versions
        return ServiceResult(jurisdiction)
      }
    }
    return ServiceError(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id, effective }))
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Reading Jurisdiction', error)
    return ServiceError(error)
  }
}
