import express from 'express'
import morgan from 'morgan'
import logger from '@mds-core/mds-logger'
import { AuthorizerClaims } from '@mds-core/mds-api-authorizer'
import { ApiRequest, ApiResponse, ApiResponseLocals } from '../@types'

export type RequestLoggingMiddlewareOptions = Partial<{}>

export const RequestLoggingMiddleware = (options: RequestLoggingMiddlewareOptions = {}): express.RequestHandler =>
  morgan<ApiRequest, ApiResponse & ApiResponseLocals<'claims', AuthorizerClaims | null>>(
    (tokens, req, res) => {
      return [
        ...(res.locals.claims?.provider_id ? [res.locals.claims.provider_id] : []),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms'
      ]
        .filter((token): token is string => token !== undefined)
        .join(' ')
    },
    {
      skip: (req, res) => {
        const { REQUEST_LOGGING_LEVEL = 0 } = process.env
        return res.statusCode < Number(REQUEST_LOGGING_LEVEL)
      },
      // Use logger, but remove extra line feed added by morgan stream option
      stream: { write: msg => logger.info(msg.slice(0, -1)) }
    }
  )
