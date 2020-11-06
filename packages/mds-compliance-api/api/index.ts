import express from 'express'
import { pathPrefix } from '@mds-core/mds-utils'
import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { ComplianceApiVersionMiddleware } from '../middleware'
import { CreateComplianceHandler, DeleteComplianceHandler, GetComplianceHandler, GetComplianceHandler, UpdateComplianceHandler } from '../handlers'
import { ComplianceApiAccessTokenScopes } from '../@types'

const checkComplianceApiAccess = (validator: AccessTokenScopeValidator<ComplianceApiAccessTokenScopes>) => checkAccess(validator)

export const api = (app: express.Express): express.Express =>
  app
    .use(ComplianceApiVersionMiddleware)
    .get(
      pathPrefix('/compliance'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:read')),
      GetComplianceHandler
    )
    .get(
      pathPrefix('/compliance/:compliance_id'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:read')),
      GetComplianceHandler
    )
    .post(
      pathPrefix('/compliance'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:write')),
      CreateComplianceHandler
    )
    .put(
      pathPrefix('/compliance/:compliance_id'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:write')),
      UpdateComplianceHandler
    )
    .delete(
      pathPrefix('/compliance/:compliance_id'),
      checkComplianceApiAccess(scopes => scopes.includes('compliance:write')),
      DeleteComplianceHandler
    )
