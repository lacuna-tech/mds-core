import { ComplianceServiceClient, ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import db from '@mds-core/mds-db'
import { providerName, providers } from '@mds-core/mds-providers'
import { ApiRequestQuery } from '@mds-core/mds-api-server'
import express from 'express'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { Policy, Timestamp } from '@mds-core/mds-types'
import { BadParamsError, isDefined, now, uuid } from '@mds-core/mds-utils'
import { ComplianceAggregate, ComplianceApiRequest, ComplianceApiResponse, ComplianceViolationPeriod } from '../@types'

export type ComplianceApiGetViolationPeriodsRequest = ComplianceApiRequest &
  ApiRequestQuery<'start_time' | 'end_time' | 'provider_ids' | 'policy_ids'>

export type ComplianceApiGetViolationPeriodsResponse = ComplianceApiResponse<{
  start_time: Timestamp
  end_time: Timestamp
  results: ComplianceAggregate[]
}>

// The keys take the format `${provider_id},${policy_id}`
interface ComplianceAggregateMap {
  [k: string]: {
    complianceSnapshotViolationGroupings: ComplianceSnapshotDomainModel[][]
    complianceSnapshots: null | ComplianceSnapshotDomainModel[]
  }
}

async function convertComplianceSnapshotsArrayToComplianceViolationPeriod(
  snapshots: ComplianceSnapshotDomainModel[]
): Promise<ComplianceViolationPeriod> {
  const compliance_array_response_id = uuid()
  const finalSnapshot = snapshots[snapshots.length - 1]
  const end_time = finalSnapshot.total_violations === 0 ? finalSnapshot.compliance_as_of : null
  return {
    start_time: snapshots[0].compliance_as_of,
    end_time,
    snapshots_uri: `/compliance_snapshot_ids?token=${compliance_array_response_id}`
  }
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
        return provider_ids ?? Object.keys(providers)
      }
      if (scopes.includes('compliance:read:provider')) {
        if (res.locals.claims && res.locals.claims.provider_id) {
          const { provider_id } = res.locals.claims
          return [provider_id]
        }
        throw new BadParamsError('provider_id missing from token with compliance:read:provider scope')
      }
    })()

    const policyIDsOptionValue = policy_ids ?? (await db.readActivePolicies()).map((p: Policy) => p.policy_id)
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time,
      end_time,
      provider_ids: providerIDsOptionValue,
      policy_ids: policyIDsOptionValue
    })

    const complianceAggregateMap: ComplianceAggregateMap = {}

    /**
     * Iterate through all compliance snapshots. For each policy-provider pair, build up arrays of
     * contiguous compliance snapshots that contain violations. End the array when a compliance snapshot
     * is encountered that has no violations. E.g. if for Jump and policy A, there are snapshots B, C, D, E,
     * and F, and B, C, E and F contain violations, B and C get grouped together and eventually put into the
     * same instance of a ComplianceViolationPeriod, and E and F get grouped together. D is basically ignored.
     * Add the first compliance snapshot that has zero violations. The timestamp on that snapshot is when the
     * violation period ended. If the snapshot have violations till the end of the query period, the end time
     * of the violation period is unknown, and therefore set to null.
     */
    complianceSnapshots.forEach(complianceSnapshot => {
      const { provider_id } = complianceSnapshot
      const { policy_id } = complianceSnapshot.policy
      const key = `${provider_id},${policy_id}`
      if (!isDefined(complianceAggregateMap[key])) {
        complianceAggregateMap[key] = {
          complianceSnapshotViolationGroupings: [],
          complianceSnapshots: null
        }
      }

      const mapEntry = complianceAggregateMap[key]
      if (complianceSnapshot.total_violations > 0) {
        if (mapEntry.complianceSnapshots === null) {
          mapEntry.complianceSnapshots = [complianceSnapshot]
        } else {
          mapEntry.complianceSnapshots.push(complianceSnapshot)
        }
      } else if (mapEntry.complianceSnapshots !== null) {
        mapEntry.complianceSnapshots.push(complianceSnapshot)
        mapEntry.complianceSnapshotViolationGroupings.push(mapEntry.complianceSnapshots)
        mapEntry.complianceSnapshots = null
      }
    })

    Object.keys(complianceAggregateMap).forEach(key => {
      const mapEntry = complianceAggregateMap[key]
      if (mapEntry.complianceSnapshots !== null) {
        mapEntry.complianceSnapshotViolationGroupings.push(mapEntry.complianceSnapshots)
      }
    })

    const results: ComplianceAggregate[] = await Promise.all(
      Object.keys(complianceAggregateMap).map(async key => {
        const { 0: provider_id, 1: policy_id } = key.split(',')
        const violationPeriods: ComplianceViolationPeriod[] = await Promise.all(
          complianceAggregateMap[key].complianceSnapshotViolationGroupings.map(complianceGroup => {
            return convertComplianceSnapshotsArrayToComplianceViolationPeriod(complianceGroup)
          })
        )

        return {
          provider_id,
          policy_id,
          provider_name: providerName(provider_id),
          violation_periods: violationPeriods
        }
      })
    )

    const { version } = res.locals
    return res.status(200).send({ version, start_time, end_time, results })
  } catch (error) {
    if (error instanceof BadParamsError) {
      return res.status(403).send({ error })
    }
    res.status(500).send({ error })
  }
}
