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

import { Timestamp, Jurisdiction } from '@mds-core/mds-types'
import { DeepPartial } from 'typeorm'
import { validateJurisdiction } from '@mds-core/mds-schema-validators'
import { v4 as uuid } from 'uuid'
import { CreateJurisdictionType } from '../../@types'
import { JurisdictionEntity } from '../repository/entities'

export const AsJurisdiction = (effective: Timestamp = Date.now()) => (
  entity: JurisdictionEntity | undefined
): Jurisdiction | null => {
  if (entity) {
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
  }
  return null
}

export const AsJurisdictionEntity = (jurisdiction: CreateJurisdictionType): DeepPartial<JurisdictionEntity> => {
  const recorded = Date.now()
  const { jurisdiction_id = uuid(), agency_key, agency_name, geography_id, timestamp = recorded } = jurisdiction
  validateJurisdiction({ jurisdiction_id, agency_key, agency_name, geography_id, timestamp })
  const entity: DeepPartial<JurisdictionEntity> = {
    jurisdiction_id,
    agency_key,
    versions: [{ timestamp, agency_name, geography_id }],
    recorded
  }
  return entity
}
