import express from 'express'
import { pathPrefix } from '@mds-core/mds-utils'
import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { ComplianceApiVersionMiddleware } from '../middleware'
import { GetCompliancesHandler, GetViolationPeriodsHandler } from '../handlers'
import { ComplianceApiAccessTokenScopes } from '../@types'

/* Compliance snapshots are taken at regular time intervals. If the gap between two
 * snapshots is bigger than this time interval, that indicates a period where
 * a provider was not in violation of any policies.
 */
const SNAPSHOT_INTERVAL = 300000

const checkComplianceApiAccess = (validator: AccessTokenScopeValidator<ComplianceApiAccessTokenScopes>) =>
  checkAccess(validator)

export const api = (app: express.Express): express.Express =>
  app
    .use(ComplianceApiVersionMiddleware)
    .get(
      pathPrefix('/violation_periods'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:read')),
      GetViolationPeriodsHandler
    )
    .get(
      pathPrefix('/compliances'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:read')),
      GetCompliancesHandler
    )
