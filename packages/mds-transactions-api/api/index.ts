import express from 'express'
import { pathPrefix } from '@mds-core/mds-utils'
import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { TransactionApiVersionMiddleware } from '../middleware'
import { CreateTransactionHandler, DeleteTransactionHandler, GetTransactionsHandler, GetTransactionHandler, UpdateTransactionHandler } from '../handlers'
import { TransactionApiAccessTokenScopes } from '../@types'

const checkTransactionApiAccess = (validator: AccessTokenScopeValidator<TransactionApiAccessTokenScopes>) => checkAccess(validator)

export const api = (app: express.Express): express.Express =>
  app
    .use(TransactionApiVersionMiddleware)
    .get(
      pathPrefix('/transactions'),
      checkTransactionApiAccess(scopes => scopes.includes('transactions:read')),
      GetTransactionsHandler
    )
    .get(
      pathPrefix('/transactions/:transaction_id'),
      checkTransactionApiAccess(scopes => scopes.includes('transactions:read')),
      GetTransactionHandler
    )
    .post(
      pathPrefix('/transactions'),
      checkTransactionApiAccess(scopes => scopes.includes('transactions:write')),
      CreateTransactionHandler
    )
    .put(
      pathPrefix('/transactions/:transaction_id'),
      checkTransactionApiAccess(scopes => scopes.includes('transactions:write')),
      UpdateTransactionHandler
    )
    .delete(
      pathPrefix('/transactions/:transaction_id'),
      checkTransactionApiAccess(scopes => scopes.includes('transactions:write')),
      DeleteTransactionHandler
    )
