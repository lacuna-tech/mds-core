import { ComplianceServiceClient, ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import db from '@mds-core/mds-db'
import { providerName, providers } from '@mds-core/mds-providers'
import { ApiRequestQuery } from '@mds-core/mds-api-server'
import express from 'express'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { Policy, Timestamp } from '@mds-core/mds-types'
import { isDefined, now } from '@mds-core/mds-utils'
import { isValidProviderId } from '@mds-core/mds-schema-validators'
import { ComplianceAggregate, ComplianceApiRequest, ComplianceApiResponse, ComplianceViolationPeriod } from '../@types'

export type ComplianceApiGetViolationPeriodsRequest = ComplianceApiRequest &
  ApiRequestQuery<'start_time' | 'end_time' | 'provider_ids' | 'policy_ids'>

export type ComplianceApiGetViolationPeriodsResponse = ComplianceApiResponse<{
  start_time: Timestamp
  end_time: Timestamp
  results: ComplianceAggregate[]
}>

interface ComplianceAggregateMap {
  [k: string]: {
    complianceViolationPeriods: ComplianceViolationPeriod[]
    complianceSnapshots: null | ComplianceSnapshotDomainModel[]
  }
}

function convertSnapshotsToViolationPeriod(snapshots: ComplianceSnapshotDomainModel[]): ComplianceViolationPeriod {
  return {
    start_time: snapshots[0].compliance_as_of,
    end_time: snapshots[snapshots.length - 1].compliance_as_of,
    // TODO finish rest of URL
    snapshots_uri: snapshots.map(s => s.compliance_snapshot_id).join(',')
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
    const { provider_ids, policy_ids } = parseRequest(req)
      .single({ parser: (str: string | undefined | null) => str?.split(',') })
      .query('provider_ids', 'policy_ids')

    let p_provider_ids
    if (scopes.includes('compliance:read:provider')) {
      if (res.locals.claims && isValidProviderId(res.locals.claims.provider_id)) {
        const { provider_id } = res.locals.claims
        p_provider_ids = [provider_id]
      } else {
        return res.status(403).send({ error: 'compliance:read:provider token missing valid provider_id' })
      }
    } else if (scopes.includes('compliance:read')) {
      p_provider_ids = provider_ids ?? Object.keys(providers)
    }

    const p_policy_ids = policy_ids ?? (await db.readActivePolicies()).map((p: Policy) => p.policy_id)
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time,
      end_time,
      provider_ids: p_provider_ids,
      policy_ids: p_policy_ids
    })

    const complianceAggregateMap: ComplianceAggregateMap = {}

    complianceSnapshots.forEach(complianceSnapshot => {
      const { provider_id } = complianceSnapshot
      const { policy_id } = complianceSnapshot.policy
      const key = `${provider_id},${policy_id}`
      if (!isDefined(complianceAggregateMap[key])) {
        complianceAggregateMap[key] = {
          complianceViolationPeriods: [],
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
        const mapEntrySnapshots = mapEntry.complianceSnapshots
        const complianceViolationPeriod = convertSnapshotsToViolationPeriod(mapEntrySnapshots)
        mapEntry.complianceViolationPeriods.push(complianceViolationPeriod)
        mapEntry.complianceSnapshots = null
      }
    })

    const results: ComplianceAggregate[] = []
    Object.keys(complianceAggregateMap).forEach(key => {
      const { 0: provider_id, 1: policy_id } = key.split(',')
      const mapEntry = complianceAggregateMap[key]
      if (mapEntry.complianceSnapshots !== null) {
        mapEntry.complianceViolationPeriods.push(convertSnapshotsToViolationPeriod(mapEntry.complianceSnapshots))
      }
      results.push({
        provider_id,
        policy_id,
        provider_name: providerName(provider_id),
        violation_periods: mapEntry.complianceViolationPeriods
      })
    })

    const { version } = res.locals
    return res.status(200).send({ version, start_time, end_time, results })
  } catch (error) {
    res.status(500).send({ error })
  }
}
