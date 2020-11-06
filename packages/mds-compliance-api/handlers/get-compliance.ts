import { ComplianceServiceClient, ComplianceDomainModel } from '@lacuna-core/lacuna-compliance-service'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiGetComplianceRequest = ComplianceApiRequest

export type ComplianceApiGetComplianceResponse = ComplianceApiResponse<{ compliance: ComplianceDomainModel[] }>

export const GetComplianceHandler = async (req: ComplianceApiGetComplianceRequest, res: ComplianceApiGetComplianceResponse) => {
  try {
    const compliance = await ComplianceServiceClient.getCompliance()
    const { version } = res.locals
    return res.status(200).send({ version, compliance })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
