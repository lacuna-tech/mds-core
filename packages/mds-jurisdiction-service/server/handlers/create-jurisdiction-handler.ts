import { ServiceResponse, ServiceError, ServiceResult } from '@mds-core/mds-service-helpers'
import { Jurisdiction } from '@mds-core/mds-types'
import { ValidationError, ConflictError, ServerError } from '@mds-core/mds-utils'
import { CreateJurisdictionType } from '../../@types'
import { CreateJurisdictionsHandler } from './create-jurisdictions-handler'

export const CreateJurisdictionHandler = async (
  jurisdiction: CreateJurisdictionType
): Promise<ServiceResponse<Jurisdiction, ValidationError | ConflictError>> => {
  const [error, jurisdictions] = await CreateJurisdictionsHandler([jurisdiction])
  return error || !jurisdictions ? ServiceError(error ?? new ServerError()) : ServiceResult(jurisdictions[0])
}
