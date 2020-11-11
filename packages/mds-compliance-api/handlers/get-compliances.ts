import { ComplianceServiceClient, ComplianceDomainModel } from '@lacuna-core/lacuna-compliance-service'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiGetCompliancesRequest = ComplianceApiRequest

export type ComplianceApiGetCompliancesResponse = ComplianceApiResponse<{ compliances: ComplianceDomainModel[] }>

export const GetCompliancesHandler = async (req: ComplianceApiGetCompliancesRequest, res: ComplianceApiGetCompliancesResponse) => {
  try {
    const compliances = await ComplianceServiceClient.getCompliances()
    const { version } = res.locals
    return res.status(200).send({ version, compliances })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
