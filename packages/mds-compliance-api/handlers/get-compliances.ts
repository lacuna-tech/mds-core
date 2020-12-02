import { ComplianceServiceClient, ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiGetCompliancesRequest = ComplianceApiRequest

export type ComplianceApiGetCompliancesResponse = ComplianceApiResponse<{
  compliances: ComplianceSnapshotDomainModel[]
}>

export const GetCompliancesHandler = async (
  req: ComplianceApiGetCompliancesRequest,
  res: ComplianceApiGetCompliancesResponse
) => {
  try {
    //    const compliances = await ComplianceServiceClient.getCompliances()
    //   const { version } = res.locals
    //  return res.status(200).send({ version, compliances })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
