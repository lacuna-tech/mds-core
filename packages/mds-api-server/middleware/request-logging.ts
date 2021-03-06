/**
 * Copyright 2019 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import logger from '@mds-core/mds-logger'
import express from 'express'
import httpContext from 'express-http-context'
import HttpStatus from 'http-status-codes'
import morgan from 'morgan'
import { ApiRequest, ApiResponse, ApiResponseLocalsClaims } from '../@types'

const { REQUEST_LOGGING_LEVEL = HttpStatus.OK } = process.env

export type RequestLoggingMiddlewareOptions = Partial<{
  filters: Array<{ path: RegExp; level: number }>
}>

export const RequestLoggingMiddleware = ({
  filters = []
}: RequestLoggingMiddlewareOptions = {}): express.RequestHandler[] => [
  morgan<ApiRequest, ApiResponse & ApiResponseLocalsClaims>(
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
      skip: (req: ApiRequest, res: ApiResponse): boolean => {
        return (
          res.statusCode < Number(filters.find(filter => req.path.match(filter.path))?.level ?? REQUEST_LOGGING_LEVEL)
        )
      },
      // Use logger, but remove extra line feed added by morgan stream option
      stream: { write: msg => logger.info(msg.slice(0, -1)) }
    }
  ),
  httpContext.middleware,
  (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
    const xRequestId = req.get('x-request-id')
    if (xRequestId) {
      httpContext.set('x-request-id', xRequestId)
    }
    return next()
  },
  (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
    const { REQUEST_DEBUG } = process.env

    if (REQUEST_DEBUG === 'true') {
      const { body, params, query } = req
      logger.debug('REQUEST_DEBUG::BODY', { body })
      logger.debug('REQUEST_DEBUG::PARAMS', { params })
      logger.debug('REQUEST_DEBUG::QUERY', { query })
    }

    return next()
  }
]
