import httpContext from 'express-http-context'
import express from 'express'
import { ApiRequest, ApiResponse } from '../@types'

export const HttpContextMiddleware = () => httpContext.middleware

export const RequestIdMiddleware = () => (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
  httpContext.set('x-request-id', res.get('x-request-id'))
  return next()
}