import { ComplianceServiceClient, ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { ComplianceApiResponse, ComplianceApiRequest } from '../@types'

export type ComplianceApiGetComplianceRequest = ComplianceApiRequest & ApiRequestParams<'compliance_snapshot_id'>

export type ComplianceApiGetComplianceResponse = ComplianceApiResponse<{ compliance: ComplianceSnapshotDomainModel }>

export const GetViolationDetailsSnapshot = async (
  req: ComplianceApiGetComplianceRequest,
  res: ComplianceApiGetComplianceResponse
) => {
  try {
    const { compliance_snapshot_id } = req.params
    const compliance = await ComplianceServiceClient.getComplianceSnapshot({ compliance_snapshot_id })
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
