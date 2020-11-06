import { ComplianceServiceClient, ComplianceDomainModel } from '@lacuna-core/lacuna-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiUpdateComplianceRequest = ComplianceApiRequest<ComplianceDomainModel>

export type ComplianceApiUpdateComplianceResponse = ComplianceApiResponse<{ compliance: ComplianceDomainModel }>

export const UpdateComplianceHandler = async (req: ComplianceApiUpdateComplianceRequest, res: ComplianceApiUpdateComplianceResponse) => {
  try {
    const { body } = req
    const compliance = await ComplianceServiceClient.updateCompliance(body)
    const { version } = res.locals
    return res.status(200).send({ version, compliance })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'ValidationError') {
        return res.status(400).send({ error })
      }
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
      if (error.type === 'ConflictError') {
        return res.status(409).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
