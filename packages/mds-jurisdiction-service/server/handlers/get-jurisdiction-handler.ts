import { UUID, Jurisdiction } from '@mds-core/mds-types'
import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import { NotFoundError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { GetJurisdictionsOptions } from '../../@types'
import { AsJurisdiction } from './utils'
import { JurisdictionRepository } from '../repository'

export const GetJurisdictionHandler = async (
  jurisdiction_id: UUID,
  { effective = Date.now() }: Partial<GetJurisdictionsOptions> = {}
): Promise<ServiceResponse<Jurisdiction, NotFoundError>> => {
  try {
    const entity = await JurisdictionRepository.readJurisdiction(jurisdiction_id)
    const [jurisdiction] = [entity].map(AsJurisdiction(effective))
    return jurisdiction
      ? ServiceResult(jurisdiction)
      : ServiceError(new NotFoundError('Jurisdiction Not Found', { jurisdiction_id, effective }))
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Reading Jurisdiction', error)
    return ServiceError(error)
  }
}
