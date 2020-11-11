import { ComplianceServiceClient, ComplianceDomainModel } from '@mds-core/mds-compliance-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiCreateCompliancesRequest = ComplianceApiRequest<ComplianceDomainModel[]>

export type ComplianceApiCreateCompliancesResponse = ComplianceApiResponse<{ compliances: ComplianceDomainModel[] }>

// TODO consolidate with create single
export const CreateCompliancesHandler = async (
  req: ComplianceApiCreateCompliancesRequest,
  res: ComplianceApiCreateCompliancesResponse
) => {
  try {
    const compliances = await ComplianceServiceClient.createCompliances(req.body)
    const { version } = res.locals
    return res.status(201).send({ version, compliances })
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
