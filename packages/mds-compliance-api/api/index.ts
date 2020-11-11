import express from 'express'
import { pathPrefix } from '@mds-core/mds-utils'
import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { ComplianceApiVersionMiddleware } from '../middleware'
import {
  CreateComplianceHandler,
  DeleteComplianceHandler,
  GetCompliancesHandler,
  GetComplianceHandler,
  UpdateComplianceHandler
} from '../handlers'
import { ComplianceApiAccessTokenScopes } from '../@types'

const checkComplianceApiAccess = (validator: AccessTokenScopeValidator<ComplianceApiAccessTokenScopes>) =>
  checkAccess(validator)

export const api = (app: express.Express): express.Express =>
  app
    .use(ComplianceApiVersionMiddleware)
    .get(
      pathPrefix('/compliances'),
      checkComplianceApiAccess(scopes => scopes.includes('compliances:read')),
      GetCompliancesHandler
    )
    .get(
      pathPrefix('/compliances/:compliance_id'),
      checkComplianceApiAccess(scopes => scopes.includes('compliances:read')),
      GetComplianceHandler
    )
    .post(
      pathPrefix('/compliances'),
      checkComplianceApiAccess(scopes => scopes.includes('compliances:write')),
      CreateComplianceHandler
    )
    .put(
      pathPrefix('/compliances/:compliance_id'),
      checkComplianceApiAccess(scopes => scopes.includes('compliances:write')),
      UpdateComplianceHandler
    )
    .delete(
      pathPrefix('/compliances/:compliance_id'),
      checkComplianceApiAccess(scopes => scopes.includes('compliances:write')),
      DeleteComplianceHandler
    )
