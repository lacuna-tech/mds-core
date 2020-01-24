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

import { pathsFor, normalizeToArray } from '@mds-core/mds-utils'
import { checkAccess, providerClaimMiddleware } from '@mds-core/mds-api-server'
import { UUID } from '@mds-core/mds-types'
import {
  getStateSnapshot,
  getEventSnapshot,
  getTelemetryCounts,
  getEventCounts,
  getAll,
  getAllStubbed
} from './request-handlers'

function api(app: express.Express): express.Express {
  app.get(
    pathsFor('/state_snapshot'),
    checkAccess(scopes => scopes.includes('admin:all')),
    getStateSnapshot
  )

  app.get(
    pathsFor('/event_snapshot'),
    checkAccess(scopes => scopes.includes('admin:all')),
    getEventSnapshot
  )

  app.get(
    pathsFor('/telemetry_counts'),
    checkAccess(scopes => scopes.includes('admin:all')),
    getTelemetryCounts
  )

  app.get(
    pathsFor('/event_counts'),
    checkAccess(scopes => scopes.includes('admin:all')),
    getEventCounts
  )

  app.get(
    pathsFor('/all'),
    checkAccess(scopes => scopes.includes('metrics:read') || scopes.includes('metrics:read:provider')),
    async (req, res, next) => {
      if (res.locals.scopes.includes('metrics:read')) {
        const provider_ids = normalizeToArray<UUID>(req.query.provider_id)
        res.locals.provider_ids = provider_ids
      } else if (res.locals.scopes.includes('metrics:read:provider')) {
        const provider_id = await providerClaimMiddleware(req, res)
        if (provider_id === false) {
          return
        }
        // The query param provider ids can only be an empty array or a singleton array
        // with only the claimed provider id
        // This loop makes sure we have [] or [provider_id] only
        for (const queryProviderId of normalizeToArray<UUID>(req.query.provider_id)) {
          // provider id query params are validated in the request handler method
          if (queryProviderId !== provider_id) {
            return res
              .status(403)
              .send(`Provider id ${queryProviderId} does not match claim provider id ${provider_id}`)
          }
        }
        // res.locals.provider_ids must contain provider_id from claim
        res.locals.provider_ids = [provider_id]
      } else {
        return res.status(401).send('Unauthorized')
      }
      next()
    },
    getAll
  )

  app.get(
    pathsFor('/all_stubbed'),
    checkAccess(scopes => scopes.includes('admin:all')),
    getAllStubbed
  )

  return app
}

export { api }
