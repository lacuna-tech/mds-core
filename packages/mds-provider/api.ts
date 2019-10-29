/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import express from 'express'
import logger from '@mds-core/mds-logger'
import { pathsFor, NotImplementedError } from '@mds-core/mds-utils'
import { checkAccess } from '@mds-core/mds-api-server'
import { ProviderApiRequest, ProviderApiResponse } from './types'

function api(app: express.Express): express.Express {
  //
  // Middleware
  //
  app.use(async (req: ProviderApiRequest, res: ProviderApiResponse, next) => {
    try {
      if (!(req.path.includes('/health') || req.path === '/')) {
        if (res.locals.claims) {
          logger.info(req.method, req.originalUrl)
        } else {
          return res.status(401).send('Unauthorized')
        }
      }
    } catch (err) {
      const desc = err instanceof Error ? err.message : err
      const stack = err instanceof Error ? err.stack : desc
      await logger.error(req.originalUrl, 'request validation fail:', desc, stack || JSON.stringify(err))
    }
    return next()
  })

  //
  // Routes
  //
  app.get(
    pathsFor('/trips'),
    checkAccess(scopes => scopes.includes('trips:read')),
    async (req: ProviderApiRequest, res: ProviderApiResponse) => {
      res.status(501).send(new NotImplementedError(`${req.path} is not implemented`))
    }
  )

  app.get(
    pathsFor('/status_changes'),
    checkAccess(scopes => scopes.includes('status_changes:read')),
    async (req: ProviderApiRequest, res: ProviderApiResponse) => {
      res.status(501).send(new NotImplementedError(`${req.path} is not implemented`))
    }
  )

  return app
}

export { api }
