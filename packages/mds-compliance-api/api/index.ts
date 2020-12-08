import express from 'express'
import { pathPrefix } from '@mds-core/mds-utils'
import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { ComplianceApiVersionMiddleware } from '../middleware'
import { GetCompliancesHandler, GetViolationPeriodsHandler } from '../handlers'
import { ComplianceApiAccessTokenScopes } from '../@types'

const checkComplianceApiAccess = (validator: AccessTokenScopeValidator<ComplianceApiAccessTokenScopes>) =>
  checkAccess(validator)

export const api = (app: express.Express): express.Express =>
  app
    .use(ComplianceApiVersionMiddleware)
    .get(
      pathPrefix('/violation_periods'),
      checkComplianceApiAccess(
        scopes => scopes.includes('compliance:read') || scopes.includes('compliance:read:provider')
      ),
      GetViolationPeriodsHandler
    )
    .get(
      pathPrefix('/compliances'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:read')),
      GetCompliancesHandler
    )
