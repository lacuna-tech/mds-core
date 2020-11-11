import { ComplianceServiceClient, ComplianceDomainModel } from '@lacuna-core/lacuna-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { ComplianceApiResponse, ComplianceApiRequest } from '../@types'

export type ComplianceApiGetComplianceRequest = ComplianceApiRequest & ApiRequestParams<'name'>

export type ComplianceApiGetComplianceResponse = ComplianceApiResponse<{ compliance: ComplianceDomainModel }>

export const GetComplianceHandler = async (req: ComplianceApiGetComplianceRequest, res: ComplianceApiGetComplianceResponse) => {
  try {
    const { name } = req.params
    const compliance = await ComplianceServiceClient.getCompliance(name)
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
