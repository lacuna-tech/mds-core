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
import { providerName } from '@mds-core/mds-providers' // map of uuids -> obj

import { isUUID, pathsFor } from '@mds-core/mds-utils'
import { checkAccess } from '@mds-core/mds-api-server'
import { ProviderApiRequest, ProviderApiResponse } from './types'
import { getEventsAsStatusChanges, getEventsAsTrips } from './legacy'

function api(app: express.Express): express.Express {
  // / ////////// utilities ////////////////

  /**
   * Provider-specific middleware to extract provider_id into locals, do some logging, etc.
   */
  app.use(async (req: ProviderApiRequest, res: ProviderApiResponse, next) => {
    try {
      if (!(req.path.includes('/health') || req.path === '/')) {
        if (res.locals.claims) {
          const { provider_id } = res.locals.claims

          /* istanbul ignore next */
          if (!provider_id) {
            await logger.warn('missing_provider_id', req.originalUrl)
            return res.status(403).send({
              error: 'missing_provider_id'
            })
          }

          /* istanbul ignore next */
          if (!isUUID(provider_id)) {
            await logger.warn('invalid_provider_id is not a UUID', provider_id, req.originalUrl)
            return res.status(403).send({
              error: 'invalid_provider_id',
              error_description: `invalid provider_id ${provider_id} is not a UUID`
            })
          }

          logger.info(providerName(provider_id), req.method, req.originalUrl)
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

  // / //////////////////////// basic gets /////////////////////////////////

  // / /////////////////////// trips /////////////////////////////////

  app.get(pathsFor('/trips'), checkAccess(scopes => scopes.includes('trips:read')), getEventsAsTrips)

  // / ////////////////////////////// status_changes /////////////////////////////

  app.get(
    pathsFor('/status_changes'),
    checkAccess(scopes => scopes.includes('status_changes:read')),
    getEventsAsStatusChanges
  )

  return app
}

export { api }
