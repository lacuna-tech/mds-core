import {
  ComplianceServiceClient,
  ComplianceSnapshotDomainModel,
  GetComplianceSnapshotOptions
} from '@mds-core/mds-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { isDefined, now, ValidationError } from '@mds-core/mds-utils'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { isValidProviderId, isValidUUID } from '@mds-core/mds-schema-validators'
import { ValidateGetComplianceSnapshotsByTimeIntervalOptions } from '@mds-core/mds-compliance-service/service/validators'
import { ComplianceApiResponse, ComplianceApiRequest } from '../@types'

export type ComplianceApiGetViolationDetailsSnapshotRequest = ComplianceApiRequest &
  ApiRequestParams<'', 'compliance_snapshot_id' | 'provider_id' | 'policy_id' | 'compliance_as_of'>

export type ComplianceApiGetViolationDetailsSnapshotResponse = ComplianceApiResponse<{
  compliance: ComplianceSnapshotDomainModel
}>

/**
 * This endpoint can take one of either two sets of request parameters:
 * 1. compliance_snapshot_id
 * 2. compliance_as_of, policy_id, and provider_id. compliance_as_of defaults to now() if not supplied,
 * and provider_id can be taken from the claim in the JWT, if present.
 */
export const GetViolationDetailsSnapshotHandler = async (
  req: ComplianceApiGetViolationDetailsSnapshotRequest,
  res: ComplianceApiGetViolationDetailsSnapshotResponse
) => {
  try {
    const { compliance_as_of = now() } = parseRequest(req).single({ parser: Number }).query('compliance_as_of')
    const { compliance_snapshot_id, policy_id } = parseRequest(req)
      .single({ parser: s => s })
      .query('compliance_snapshot_id', 'policy_id')

    /**
     *  If the user is a provider, they can only see snapshots related to themselves.
     *  Otherwise, the user is an agency, and can query for snapshots belonging to any provider.
     */
    const { provider_id } =
      res.locals.scopes.includes('compliance:read:provider') && res.locals.claims && res.locals.claims.provider_id
        ? res.locals.claims
        : parseRequest(req)
            .single({ parser: s => s })
            .query('provider_id')

    if (!isDefined(compliance_snapshot_id) && (!isDefined(policy_id) || !isDefined(provider_id))) {
      return res.status(400).send({
        error:
          'Required combination of parameters is incorrect. Either give a valid compliance_snapshot_id, or a valid policy_id and provider_id, and optionally compliance_as_of timestamp'
      })
    }
    const options = compliance_snapshot_id ? { compliance_snapshot_id } : { provider_id, policy_id, compliance_as_of }

    const compliance = await ComplianceServiceClient.getComplianceSnapshot(options as GetComplianceSnapshotOptions)
    const { version } = res.locals
    return res.status(200).send({ version, compliance })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
    }

    return res.status(404).send({ error })
  }
}
