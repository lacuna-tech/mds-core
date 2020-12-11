import { ComplianceServiceClient } from '@mds-core/mds-compliance-service'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { UUID } from '@mds-core/mds-types'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { isDefined } from '@mds-core/mds-utils'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiGetComplianceSnapshotIDsRequest = ComplianceApiRequest & ApiRequestParams<'token'>

export type ComplianceApiGetComplianceSnapshotIDsResponse = ComplianceApiResponse<{
  data: UUID[]
}>

export const GetComplianceSnapshotIDsHandler = async (
  req: ComplianceApiGetComplianceSnapshotIDsRequest,
  res: ComplianceApiGetComplianceSnapshotIDsResponse
) => {
  try {
    const { token } = parseRequest(req)
      .single({ parser: s => s })
      .query('token')

    if (!isDefined(token)) {
      return res.status(400).send({ error: 'Token not provided' })
    }

    // The token should definitely exist if we get to this point, but the compiler needs the cast to be happy
    const compliance_array_response = await ComplianceServiceClient.getComplianceArrayResponse(token as string)
    const { provider_id } = compliance_array_response
    if (
      res.locals.scopes.includes('compliance:read:provider') &&
      res.locals.claims &&
      res.locals.claims.provider_id &&
      provider_id !== res.locals.claims.provider_id
    ) {
      return res.status(403).send({ error: 'Provider is attempting to read snapshots that do not belog to them' })
    }
    const { version } = res.locals
    return res.status(200).send({ version, data: compliance_array_response.compliance_snapshot_ids })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
