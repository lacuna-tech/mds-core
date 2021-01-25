import { ComplianceServiceClient, ComplianceViolationPeriodDomainModel } from '@mds-core/mds-compliance-service'
import { ApiRequestQuery } from '@mds-core/mds-api-server'
import express from 'express'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { Timestamp } from '@mds-core/mds-types'
import { BadParamsError, isDefined, now } from '@mds-core/mds-utils'
import { ComplianceAggregate, ComplianceApiRequest, ComplianceApiResponse } from '../@types'

export type ComplianceApiGetViolationPeriodsRequest = ComplianceApiRequest &
  ApiRequestQuery<'start_time' | 'end_time' | 'provider_ids' | 'policy_ids'>

export type ComplianceApiGetViolationPeriodsResponse = ComplianceApiResponse<{
  start_time: Timestamp
  end_time: Timestamp
  results: ComplianceAggregate[]
}>

function encodeToken(ids: string[]): string {
  const buffer = Buffer.from(ids.join(','))
  return buffer.toString('base64')
}

export const GetViolationPeriodsHandler = async (
  req: ComplianceApiGetViolationPeriodsRequest,
  res: ComplianceApiGetViolationPeriodsResponse,
  next: express.NextFunction
) => {
  try {
    const { scopes } = res.locals
    const { start_time, end_time = now() } = parseRequest(req)
      .single({ parser: Number })
      .query('start_time', 'end_time')
    if (!isDefined(start_time)) {
      return res.status(400).send({ error: 'Missing required query param start_time' })
    }
    const { policy_id: policy_ids, provider_id: provider_ids } = parseRequest(req)
      .list()
      .query('provider_id', 'policy_id')

    const providerIDsOptionValue = (() => {
      if (scopes.includes('compliance:read')) {
        return provider_ids
      }
      if (scopes.includes('compliance:read:provider')) {
        if (res.locals.claims && res.locals.claims.provider_id) {
          const { provider_id } = res.locals.claims
          return [provider_id]
        }
        throw new BadParamsError('provider_id missing from token with compliance:read:provider scope')
      }
    })()

    const violationPeriodsArray = await ComplianceServiceClient.getComplianceViolationPeriods({
      start_time,
      end_time,
      provider_ids: providerIDsOptionValue,
      policy_ids
    })

    const results = violationPeriodsArray.map(periodArray => {
      const { policy_id, provider_id, provider_name, violation_periods } = periodArray
      return {
        policy_id,
        provider_id,
        provider_name,
        violation_periods: violation_periods.map((period: ComplianceViolationPeriodDomainModel) => {
          /* Can't destructure start_time and end_time or they'd shadow the start_time
           * and end_time of the whole query period.
           */
          const { compliance_snapshot_ids } = period
          return {
            start_time: period.start_time,
            end_time: period.end_time,
            snapshots_uri: `/compliance_snapshot_ids?token=${encodeToken(compliance_snapshot_ids)}`
          }
        })
      }
    })

    const { version } = res.locals
    return res.status(200).send({ version, start_time, end_time, results })
  } catch (error) {
    if (error instanceof BadParamsError) {
      return res.status(403).send({ error })
    }
    res.status(500).send({ error })
  }
}
