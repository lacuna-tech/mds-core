import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import { Jurisdiction } from '@mds-core/mds-types'
import { ServerError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { GetJurisdictionsOptions } from '../../@types'
import { AsJurisdiction } from './utils'
import * as repository from '../repository'

export const GetJurisdictionsHandler = async ({
  effective = Date.now()
}: Partial<GetJurisdictionsOptions> = {}): Promise<ServiceResponse<Jurisdiction[], ServerError>> => {
  try {
    const entities = await repository.readJurisdictions()
    const jurisdictions = entities
      .map(AsJurisdiction(effective))
      .filter((jurisdiction): jurisdiction is Jurisdiction => jurisdiction !== null)
    return ServiceResult(jurisdictions)
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Reading Jurisdicitons', error)
    return ServiceError(error)
  }
}
