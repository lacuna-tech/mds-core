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

import { UUID, Timestamp, Jurisdiction } from '@mds-core/mds-types'
import { NotFoundError, ServerError, ConflictError, ValidationError } from '@mds-core/mds-utils'
import { DeepPartial } from 'typeorm'
import logger from '@mds-core/mds-logger'
import { validateJurisdiction } from '@mds-core/mds-schema-validators'
import { v4 as uuid } from 'uuid'
import * as orm from './orm'
import { JurisdictionEntity } from './entities'

type JurisdictionServiceResult<TResult, TError extends Error> = [null, TResult] | [TError | ServerError, null]

const Success = <TResult>(result: TResult): JurisdictionServiceResult<TResult, never> => [null, result]
const Failure = <TError extends Error>(error: TError | ServerError): JurisdictionServiceResult<never, TError> => [
  error,
  null
]

interface GetJurisdictionOptions {
  effective: Timestamp
}

const AsJurisdiction = (effective: Timestamp = Date.now()) => (
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

export type CreateJurisdictionType = Partial<Pick<Jurisdiction, 'jurisdiction_id' | 'timestamp'>> &
  Pick<Jurisdiction, 'agency_key' | 'agency_name' | 'geography_id'>

const AsJurisdictionEntity = (jurisdiction: CreateJurisdictionType): DeepPartial<JurisdictionEntity> => {
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

const createJurisdictions = async (
  jurisdictions: CreateJurisdictionType[]
): Promise<JurisdictionServiceResult<Jurisdiction[], ValidationError | ConflictError>> => {
  try {
    try {
      const entities = await orm.writeJurisdictions(jurisdictions.map(AsJurisdictionEntity))
      return Success(
        entities.map(AsJurisdiction()).filter((jurisdiction): jurisdiction is Jurisdiction => jurisdiction !== null)
      )
    } catch (error) /* istanbul ignore next */ {
      await logger.error(error.message)
      return Failure(error instanceof ValidationError ? error : new ConflictError(error))
    }
  } catch (error) /* istanbul ignore next */ {
    await logger.error(error.message)
    return Failure(error instanceof ServerError ? error : new ServerError(error))
  }
}

const createJurisdiction = async (
  jurisdiction: CreateJurisdictionType
): Promise<JurisdictionServiceResult<Jurisdiction, ValidationError | ConflictError>> => {
  const [error, jurisdictions] = await createJurisdictions([jurisdiction])
  return error || !jurisdictions ? Failure(error ?? new ServerError()) : Success(jurisdictions[0])
}

export type UpdateJurisdictionType = DeepPartial<Jurisdiction>

const updateJurisdiction = async (
  jurisdiction_id: UUID,
  update: UpdateJurisdictionType
): Promise<JurisdictionServiceResult<Jurisdiction, ValidationError | NotFoundError>> => {
  if (update.jurisdiction_id && update.jurisdiction_id !== jurisdiction_id) {
    return Failure(new ValidationError('Invalid jurisdiction_id for update'))
  }
  try {
    try {
      const entity = await orm.readJurisdiction(jurisdiction_id)
      if (entity) {
        const current = AsJurisdiction()(entity)
        if (current) {
          const timestamp = update.timestamp ?? Date.now()
          if (timestamp <= current.timestamp) {
            return Failure(new ValidationError('Invalid timestamp for update'))
          }
          const updated = await orm.updateJurisdiction(jurisdiction_id, {
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
          const jurisdiction = AsJurisdiction(timestamp)(updated)
          return jurisdiction ? Success(jurisdiction) : Failure(new ServerError('Unexpected error during update'))
        }
      }
      return Failure(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id }))
    } catch (error) /* istanbul ignore next */ {
      await logger.error(error.message)
      return Failure(error)
    }
  } catch (error) /* istanbul ignore next */ {
    await logger.error(error.message)
    return Failure(error instanceof ServerError ? error : new ServerError(error))
  }
}

const deleteJurisdiction = async (
  jurisdiction_id: UUID
): Promise<JurisdictionServiceResult<Pick<Jurisdiction, 'jurisdiction_id'>, NotFoundError>> => {
  try {
    try {
      const entity = await orm.readJurisdiction(jurisdiction_id)
      if (entity) {
        const current = AsJurisdiction()(entity)
        if (current) {
          await orm.updateJurisdiction(jurisdiction_id, {
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
          return Success({ jurisdiction_id })
        }
      }
      return Failure(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id }))
    } catch (error) /* istanbul ignore next */ {
      await logger.error(error.message)
      return Failure(error)
    }
  } catch (error) /* istanbul ignore next */ {
    await logger.error(error.message)
    return Failure(error instanceof ServerError ? error : new ServerError(error))
  }
}

const getAllJurisdictions = async ({
  effective = Date.now()
}: Partial<GetJurisdictionOptions> = {}): Promise<JurisdictionServiceResult<Jurisdiction[], ServerError>> => {
  try {
    try {
      const entities = await orm.readJurisdictions()
      const jurisdictions = entities
        .map(AsJurisdiction(effective))
        .filter((jurisdiction): jurisdiction is Jurisdiction => jurisdiction !== null)
      return Success(jurisdictions)
    } catch (error) /* istanbul ignore next */ {
      await logger.error(error.message)
      return Failure(error)
    }
  } catch (error) /* istanbul ignore next */ {
    await logger.error(error.message)
    return Failure(error instanceof ServerError ? error : new ServerError(error))
  }
}

const getOneJurisdiction = async (
  jurisdiction_id: UUID,
  { effective = Date.now() }: Partial<GetJurisdictionOptions> = {}
): Promise<JurisdictionServiceResult<Jurisdiction, NotFoundError>> => {
  try {
    try {
      const entity = await orm.readJurisdiction(jurisdiction_id)
      const [jurisdiction] = [entity].map(AsJurisdiction(effective))
      return jurisdiction
        ? Success(jurisdiction)
        : Failure(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id, effective }))
    } catch (error) /* istanbul ignore next */ {
      await logger.error(error.message, error)
      return Failure(error)
    }
  } catch (error) /* istanbul ignore next */ {
    await logger.error(error.message)
    return Failure(error instanceof ServerError ? error : new ServerError(error))
  }
}

export const JurisdictionService = {
  initialize: orm.initialize,
  createJurisdictions,
  createJurisdiction,
  updateJurisdiction,
  deleteJurisdiction,
  getAllJurisdictions,
  getOneJurisdiction,
  shutdown: orm.shutdown
}
