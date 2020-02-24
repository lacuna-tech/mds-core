import { UUID, Timestamp, Jurisdiction } from '@mds-core/mds-types'
import { ConnectionManager } from '@mds-core/mds-orm'
import { NotFoundError, ServerError, ConflictError, ValidationError } from '@mds-core/mds-utils'
import { DeepPartial } from 'typeorm'
import { InsertReturning } from '@mds-core/mds-orm/types'
import logger from '@mds-core/mds-logger'
import { validateJurisdiction } from '@mds-core/mds-schema-validators'
import { JurisdictionEntity } from './entities'
import ormconfig from './ormconfig'

import uuid = require('uuid')

type JurisdictionServiceResult<TSuccess> = [Error, null] | [null, TSuccess]
const Success = <TSuccess>(result: TSuccess): JurisdictionServiceResult<TSuccess> => [null, result]
const Failure = <TSuccess>(error: Error): JurisdictionServiceResult<TSuccess> => [error, null]

interface GetJurisdictionOptions {
  effective: Timestamp
}

const manager = ConnectionManager(ormconfig)

const initialize = async () => manager.initialize()

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
): Promise<JurisdictionServiceResult<Jurisdiction[]>> => {
  try {
    const connection = await manager.getReadWriteConnection()
    const { raw: entities }: InsertReturning<JurisdictionEntity> = await connection
      .getRepository(JurisdictionEntity)
      .createQueryBuilder()
      .insert()
      .values(jurisdictions.map(AsJurisdictionEntity))
      .returning('*')
      .execute()
    return Success(
      entities.map(AsJurisdiction()).filter((jurisdiction): jurisdiction is Jurisdiction => jurisdiction !== null)
    )
  } catch (error) {
    await logger.error(error.message)
    return Failure(error instanceof ValidationError ? error : new ConflictError(error))
  }
}

const createJurisdiction = async (
  jurisdiction: CreateJurisdictionType
): Promise<JurisdictionServiceResult<Jurisdiction>> => {
  const [error, jurisdictions] = await createJurisdictions([jurisdiction])
  return error || !jurisdictions ? Failure(error ?? new ServerError()) : Success(jurisdictions[0])
}

const getAllJurisdictions = async ({
  effective = Date.now()
}: Partial<GetJurisdictionOptions> = {}): Promise<JurisdictionServiceResult<Jurisdiction[]>> => {
  try {
    const connection = await manager.getReadOnlyConnection()
    const entities = await connection
      .getRepository(JurisdictionEntity)
      .createQueryBuilder()
      .getMany()
    const jurisdictions = entities
      .map(AsJurisdiction(effective))
      .filter((jurisdiction): jurisdiction is Jurisdiction => jurisdiction !== null)
    return Success(jurisdictions)
  } catch (error) {
    await logger.error(error.message)
    return Failure(error)
  }
}

const getOneJurisdiction = async (
  jurisdiction_id: UUID,
  { effective = Date.now() }: Partial<GetJurisdictionOptions> = {}
): Promise<JurisdictionServiceResult<Jurisdiction>> => {
  try {
    const connection = await manager.getReadOnlyConnection()
    const entity = await connection
      .getRepository(JurisdictionEntity)
      .createQueryBuilder()
      .where({ jurisdiction_id })
      .getOne()
    const [jurisdiction] = [entity].map(AsJurisdiction(effective))
    return jurisdiction
      ? Success(jurisdiction)
      : Failure(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id, effective }))
  } catch (error) {
    await logger.error(error.message, error)
    return Failure(error)
  }
}

const shutdown = async () => manager.shutdown()

export const JurisdictionService = {
  initialize,
  createJurisdictions,
  createJurisdiction,
  getAllJurisdictions,
  getOneJurisdiction,
  shutdown
}
