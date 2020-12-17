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

function decodeToken(token: string): UUID[] {
  const buffer = Buffer.from(token, 'base64')
  return buffer.toString().split(',')
}

/**
 * A ComplianceAggregate might contain many, many snapshots. Instead of containing the snapshot ids
 * directly, it contains a token for each set of snapshot_ids that can be submitted to the following
 * handler. The spec makes no specific recommendations on how to associate tokens to arrays ofsnapshot
 * ids. Doing things this way enables us to easily swap in and out a different implementation in the future;
 * e.g. perhaps some day the token could correspond to a cache of the corresponding snapshot ids.
 * Currently, in this implementation, we base64-encode arrays of snapshot ids and decode the token.
 */
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

    const { version } = res.locals
    return res.status(200).send({ version, data: decodeToken(token) })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
