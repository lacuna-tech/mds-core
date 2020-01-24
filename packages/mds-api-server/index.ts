import morgan from 'morgan'
import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import logger from '@mds-core/mds-logger'
import { pathsFor, AuthorizationError, isUUID } from '@mds-core/mds-utils'
import { AuthorizationHeaderApiAuthorizer, ApiAuthorizer, AuthorizerClaims } from '@mds-core/mds-api-authorizer'
import { AccessTokenScope, UUID } from '@mds-core/mds-types'
import { Params, ParamsDictionary } from 'express-serve-static-core'
import { isProviderId, providerName } from '@mds-core/mds-providers'

export type ApiRequest<P extends Params = ParamsDictionary> = express.Request<P>

export interface ApiResponseLocals {
  claims: AuthorizerClaims | null
  scopes: AccessTokenScope[]
}

export interface ApiResponse<T = unknown> extends express.Response {
  locals: ApiResponseLocals
  send: (body: T | { error: Error }) => this
}

export interface ProviderClaimResponse extends ApiResponse {
  locals: ApiResponseLocals & {
    provider_id: UUID
  }
}

const about = () => {
  const {
    versions: { node },
    env: {
      npm_package_name: name,
      npm_package_version: version,
      npm_package_git_branch: branch,
      npm_package_git_commit: commit,
      npm_package_build_date: date,
      MAINTENANCE: maintenance
    }
  } = process
  return {
    name,
    version,
    build: { date, branch, commit },
    node,
    status: maintenance ? `${maintenance} (MAINTENANCE)` : 'Running'
  }
}

export const RequestLoggingMiddleware = () =>
  morgan(
    (tokens, req: ApiRequest, res: ApiResponse) =>
      [
        ...(res.locals.claims?.provider_id ? [res.locals.claims.provider_id] : []),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms'
      ].join(' '),
    {
      skip: (req: ApiRequest, res: ApiResponse) => {
        // By default only log 400/500 errors
        const { API_REQUEST_LOG_LEVEL = 0 } = process.env
        return res.statusCode < Number(API_REQUEST_LOG_LEVEL)
      },
      // Use logger, but remove extra line feed added by morgan stream option
      stream: { write: msg => logger.info(msg.slice(0, -1)) }
    }
  )

export const JsonBodyParserMiddleware = (options: bodyParser.OptionsJson) => bodyParser.json(options)

type CorsMiddlewareOptions = { handleCors: boolean }
export const CorsMiddleware = ({ handleCors = false }: Partial<CorsMiddlewareOptions> = {}) =>
  handleCors
    ? cors() // Server handles CORS
    : (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*')
        next()
      }

export const MaintenanceModeMiddleware = () => (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
  if (process.env.MAINTENANCE) {
    return res.status(503).send(about())
  }
  next()
}

type AuthorizerMiddlewareOptions = { authorizer: ApiAuthorizer }
export const AuthorizerMiddleware = ({
  authorizer = AuthorizationHeaderApiAuthorizer
}: Partial<AuthorizerMiddlewareOptions> = {}) => (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
  const claims = authorizer(req)
  res.locals.claims = claims
  res.locals.scopes = claims && claims.scope ? (claims.scope.split(' ') as AccessTokenScope[]) : []
  next()
}

export const AboutRequestHandler = async (req: ApiRequest, res: ApiResponse) => {
  return res.status(200).send(about())
}

export const HealthRequestHandler = async (req: ApiRequest, res: ApiResponse) => {
  return res.status(200).send({
    ...about(),
    process: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
}

export const ApiServer = (
  api: (server: express.Express) => express.Express,
  { handleCors, authorizer }: Partial<CorsMiddlewareOptions & AuthorizerMiddlewareOptions> = {},
  app: express.Express = express()
): express.Express => {
  // Disable x-powered-by header
  app.disable('x-powered-by')

  // Middleware
  app.use(
    RequestLoggingMiddleware(),
    JsonBodyParserMiddleware({ limit: '5mb' }),
    CorsMiddleware({ handleCors }),
    MaintenanceModeMiddleware(),
    AuthorizerMiddleware({ authorizer })
  )

  // Routes
  app.get(pathsFor('/'), AboutRequestHandler)
  app.get(pathsFor('/health'), HealthRequestHandler)

  return api(app)
}

/* istanbul ignore next */
export const checkAccess = (validator: (scopes: AccessTokenScope[]) => boolean | Promise<boolean>) =>
  process.env.VERIFY_ACCESS_TOKEN_SCOPE === 'false'
    ? async (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
        next() // Bypass
      }
    : async (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
        const valid = await validator(res.locals.scopes)
        return valid
          ? next()
          : res
              .status(403)
              .send({ error: new AuthorizationError('no access without scope', { claims: res.locals.claims }) })
      }

export async function providerClaimMiddleware(req: ApiRequest, res: ProviderClaimResponse) {
  if (res.locals.claims === null) {
    res.status(400).send({
      result: 'No claims provided'
    })
    return false
  }

  const { provider_id } = res.locals.claims

  if (!isUUID(provider_id)) {
    await logger.warn(req.originalUrl, req.method, 'invalid provider_id is not a UUID', provider_id)
    res.status(400).send({
      result: `invalid provider_id ${provider_id} is not a UUID`
    })
    return false
  }

  if (!isProviderId(provider_id)) {
    await logger.warn(req.originalUrl, req.method, 'invalid provider_id is not a known provider', provider_id)
    res.status(400).send({
      result: `invalid provider_id ${provider_id} is not a known provider`
    })
    return false
  }

  res.locals.provider_id = provider_id

  logger.info(providerName(provider_id), req.method, req.originalUrl)
  return provider_id
}
