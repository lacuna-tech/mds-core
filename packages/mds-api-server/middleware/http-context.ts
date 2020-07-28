import httpContext from 'express-http-context'
import express from 'express'
import { ApiRequest, ApiResponse } from '../@types'

const HttpContextMiddleware = httpContext.middleware

/**
 * Middleware that extracts the X-Request-Id header set by the gateway,
 * and includes it in contextual logs for a given request.
 */
const RequestIdMiddleware = (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
  httpContext.set('x-request-id', req.get('x-request-id'))
  return next()
}

export const HttpContextMiddlewares = () => {
  return [HttpContextMiddleware, RequestIdMiddleware]
}
