import { UUID, Timestamp } from '@mds-core/mds-types'
import { ConnectionManager } from '@mds-core/mds-orm'
import { NotFoundError } from 'packages/mds-utils'
import { JurisdictionEntity } from './entities'
import ormconfig from './ormconfig'

interface Jurisdiction {
  jurisdiction_id: UUID
  agency_key: string
  agency_name: string
  geography_id: UUID
  timestamp: Timestamp
}

type JurisdictionServiceSuccess<TSuccess> = [null, TSuccess]
const Success = <TSuccess>(result: TSuccess): JurisdictionServiceSuccess<TSuccess> => [null, result]

type JurisdictionServiceFailure = [Error, null]
const Failure = (error: Error): JurisdictionServiceFailure => [error, null]

type JurisdictionServiceResult<TSuccess> = JurisdictionServiceSuccess<TSuccess> | JurisdictionServiceFailure

interface GetJurisdictionOptions {
  effective: Timestamp
}

const manager = ConnectionManager(ormconfig)

const AsJurisdiction = (effective: Timestamp) => (entity: JurisdictionEntity | undefined): Jurisdiction | null => {
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
    const jurisdiction = AsJurisdiction(effective)(entity)
    return jurisdiction
      ? Success(jurisdiction)
      : Failure(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id }))
  } catch (error) {
    return Failure(error)
  }
}

export const JurisdictionService = { getAllJurisdictions, getOneJurisdiction }
