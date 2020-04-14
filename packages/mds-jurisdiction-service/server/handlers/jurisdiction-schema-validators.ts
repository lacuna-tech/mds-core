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

import {
  uuidSchema,
  stringSchema,
  timestampSchema,
  ValidateSchema,
  ValidationError
} from '@mds-core/mds-schema-validators'
import { UUID, Timestamp } from '@mds-core/mds-types'
import { JurisdictionDomainModel } from 'packages/mds-jurisdiction-service/@types'

export const ValidateJurisdiction = (jurisdiction: JurisdictionDomainModel): JurisdictionDomainModel => {
  try {
    ValidateSchema<UUID>(jurisdiction.jurisdiction_id, uuidSchema, { property: 'jurisdiction_id', required: true })
    ValidateSchema<string>(jurisdiction.agency_key, stringSchema, { property: 'agency_key', required: true })
    ValidateSchema<string>(jurisdiction.agency_key, stringSchema, { property: 'agency_key', required: true })
    ValidateSchema<UUID>(jurisdiction.geography_id, uuidSchema, { property: 'geography_id', required: true })
    ValidateSchema<Timestamp>(jurisdiction.timestamp, timestampSchema.max(Date.now()), {
      property: 'timestamp',
      required: true
    })
    return jurisdiction
  } catch (error) {
    throw new ValidationError('Invalid Jurisdiction', { jurisdiction, error })
  }
}
