import { ComplianceServiceClient, ComplianceDomainModel } from '@lacuna-core/lacuna-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiCreateComplianceRequest = ComplianceApiRequest<ComplianceDomainModel[]>

export type ComplianceApiCreateComplianceResponse = ComplianceApiResponse<{ compliance: ComplianceDomainModel[] }>

// TODO consolidate with create single
export const CreateComplianceHandler = async (req: ComplianceApiCreateComplianceRequest, res: ComplianceApiCreateComplianceResponse) => {
  try {
    const compliance = await ComplianceServiceClient.createCompliance(req.body)
    const { version } = res.locals
    return res.status(201).send({ version, compliance })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'ValidationError') {
        return res.status(400).send({ error })
      }
      if (error.type === 'ConflictError') {
        return res.status(409).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
