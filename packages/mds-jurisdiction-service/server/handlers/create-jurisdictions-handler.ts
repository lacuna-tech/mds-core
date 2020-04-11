import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import { Jurisdiction } from '@mds-core/mds-types'
import { ValidationError, ConflictError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { CreateJurisdictionType } from '../../@types'
import { AsJurisdictionEntity, AsJurisdiction } from './utils'
import { JurisdictionReadWriteRepository } from '../repository'

export const CreateJurisdictionsHandler = async (
  jurisdictions: CreateJurisdictionType[]
): Promise<ServiceResponse<Jurisdiction[], ValidationError | ConflictError>> => {
  try {
    const entities = await JurisdictionReadWriteRepository.writeJurisdictions(jurisdictions.map(AsJurisdictionEntity))
    return ServiceResult(
      entities.map(AsJurisdiction()).filter((jurisdiction): jurisdiction is Jurisdiction => jurisdiction !== null)
    )
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Creating Jurisdictions', error)
    return ServiceError(error instanceof ValidationError ? error : new ConflictError(error))
  }
}
