import { ComplianceServiceClient, ComplianceDomainModel } from '@lacuna-core/lacuna-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiDeleteComplianceRequest = ComplianceApiRequest & ApiRequestParams<'name'>

export type ComplianceApiDeleteComplianceResponse = ComplianceApiResponse<{ name: ComplianceDomainModel['name'] }>

export const DeleteComplianceHandler = async (req: ComplianceApiDeleteComplianceRequest, res: ComplianceApiDeleteComplianceResponse) => {
  try {
    const { name } = req.params
    await ComplianceServiceClient.deleteCompliance(name)
    const { version } = res.locals
    return res.status(200).send({ version, name })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
