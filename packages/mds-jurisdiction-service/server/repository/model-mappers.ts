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

import { Timestamp, Nullable } from '@mds-core/mds-types'
import { filterEmptyHelper } from '@mds-core/mds-utils'
import { CreateIdentityEntityModel, ModelMapper } from '@mds-core/mds-repository'
import { JurisdictionDomainModel } from '../../@types'
import { JurisdictionEntityModel } from './entities/jurisdiction-entity'

export const isJurisdiction = filterEmptyHelper<JurisdictionDomainModel>()

interface MapToDomainOptions {
  effective: Timestamp
}

interface MapToEntityOptions {
  recorded: Timestamp
}

export const JurisdictionModelMapper = {
  toDomain: ({ effective }: MapToDomainOptions): ModelMapper<JurisdictionEntityModel, JurisdictionDomainModel> => ({
    map: entities => {
      const models = entities.map<Nullable<JurisdictionDomainModel>>(entity => {
        const { jurisdiction_id, agency_key, versions } = entity
        const version = versions.find(properties => effective >= properties.timestamp)
        if (version) {
          const { agency_name, geography_id, timestamp } = version
          if (geography_id !== null) {
            return {
              jurisdiction_id,
              agency_key,
              agency_name,
              geography_id,
              timestamp
            }
          }
        }
        return null
      })
      return models.filter(isJurisdiction)
    }
  }),
  toEntity: ({
    recorded
  }: MapToEntityOptions): ModelMapper<JurisdictionDomainModel, CreateIdentityEntityModel<JurisdictionEntityModel>> => ({
    map: models => {
      const entities = models.map(model => {
        const { jurisdiction_id, agency_key, agency_name, geography_id, timestamp } = model
        return {
          jurisdiction_id,
          agency_key,
          versions: [{ timestamp, agency_name, geography_id }],
          recorded
        }
      })
      return entities
    }
  })
}
