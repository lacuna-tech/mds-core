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

import log from '@mds-core/mds-logger'
import { providerName, isProviderId } from '@mds-core/mds-providers'
import { isUUID, pathsFor } from '@mds-core/mds-utils'
import { checkAccess } from '@mds-core/mds-api-server'
import { MetricsApiRequest, MetricsApiResponse } from './types'
import { getStateSnapshot, getEventSnapshot, getLatency } from './request-handlers'

async function agencyMiddleware(req: MetricsApiRequest, res: MetricsApiResponse, next: Function) {
  try {
    // verify presence of provider_id
    if (!(req.path.includes('/health') || req.path === '/')) {
      if (res.locals.claims) {
        const { provider_id, scope } = res.locals.claims

        // no admin access without auth
        if (req.path.includes('/admin/')) {
          if (!scope || !scope.includes('admin:all')) {
            return res.status(403).send({
              result: `no admin access without admin:all scope (${scope})`
            })
          }
        }

        if (provider_id) {
          if (!isUUID(provider_id)) {
            await log.warn(req.originalUrl, 'bogus provider_id', provider_id)
            return res.status(400).send({
              result: `invalid provider_id ${provider_id} is not a UUID`
            })
          }

          if (!isProviderId(provider_id)) {
            return res.status(400).send({
              result: `invalid provider_id ${provider_id} is not a known provider`
            })
          }

          log.info(providerName(provider_id), req.method, req.originalUrl)
        }
      } else {
        return res.status(401).send('Unauthorized')
      }
    }
  } catch (err) {
    /* istanbul ignore next */
    await log.error(req.originalUrl, 'request validation fail:', err.stack)
  }
  next()
}

function api(app: express.Express): express.Express {
  /**
   * Agency-specific middleware to extract provider_id into locals, do some logging, etc.
   */
  app.use(agencyMiddleware)

  app.get(pathsFor('/state_snapshot'), checkAccess(scopes => scopes.includes('admin:all')), getStateSnapshot)

  app.get(pathsFor('/event_snapshot'), checkAccess(scopes => scopes.includes('admin:all')), getEventSnapshot)

  app.get(pathsFor('/latency'), checkAccess(scopes => scopes.includes('admin:all')), getLatency)

  return app
}

export { agencyMiddleware, api }
