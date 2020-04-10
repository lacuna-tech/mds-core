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
