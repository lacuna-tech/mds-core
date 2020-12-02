import {
  ComplianceServiceClient,
  ComplianceSnapshotDomainModel,
  GetComplianceSnapshotsByTimeIntervalOptions
} from '@mds-core/mds-compliance-service'
import { ApiRequestQuery } from '@mds-core/mds-api-server'
import express from 'express'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiGetViolationPeriodsRequest = ComplianceApiRequest &
  ApiRequestQuery<'start_time' | 'end_time' | 'provider_ids' | 'policy_ids'>

export type ComplianceApiGetViolationPeriodsResponse = ComplianceApiResponse<{
  compliances: ComplianceSnapshotDomainModel[]
}>

export const GetViolationPeriodsHandler = async (
  req: ComplianceApiGetViolationPeriodsRequest,
  res: ComplianceApiGetViolationPeriodsResponse,
  next: express.NextFunction
) => {
  try {
    const { start_time, end_time } = parseRequest(req).single({ parser: Number }).query('start_time', 'end_time')
    const { provider_ids, policy_ids } = parseRequest(req)
      //      .single({ parser: x => x })
      .single({ parser: (str: string | undefined | null) => str?.split(',') })
      .query('provider_ids', 'policy_ids')
    console.log(start_time)
    console.log(end_time)
    console.log(provider_ids)
    console.log(policy_ids)
    const compliances = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time,
      end_time,
      provider_ids,
      policy_ids
    })
    const { version } = res.locals
    return res.status(200).send({ version, compliances })
  } catch (error) {
    next(error)
  }
}
