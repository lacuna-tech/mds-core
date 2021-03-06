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

import { parseRequest } from '@mds-core/mds-api-helpers'
import { ApiRequest, ApiResponse } from '@mds-core/mds-api-server'
import db from '@mds-core/mds-db'
import logger from '@mds-core/mds-logger'
import { PolicyTypeInfo, UUID } from '@mds-core/mds-types'
import { BadParamsError, isUUID, NotFoundError, now, pathPrefix, ServerError } from '@mds-core/mds-utils'
import express, { NextFunction } from 'express'
import { PolicyApiVersionMiddleware } from './middleware'
import {
  PolicyApiGetPoliciesRequest,
  PolicyApiGetPoliciesResponse,
  PolicyApiGetPolicyRequest,
  PolicyApiGetPolicyResponse
} from './types'

function api<PInfo extends PolicyTypeInfo>(app: express.Express): express.Express {
  app.use(PolicyApiVersionMiddleware)

  app.get(
    pathPrefix('/policies'),
    async (
      req: PolicyApiGetPoliciesRequest,
      res: PolicyApiGetPoliciesResponse<PolicyTypeInfo>,
      next: express.NextFunction
    ) => {
      const { start_date = now(), end_date = now() } = req.query
      const { scopes } = res.locals

      try {
        /*
          If the client is scoped to read unpublished policies,
          they are permitted to query for both published and unpublished policies.
          Otherwise, they can only read published.
        */
        const { get_published = null, get_unpublished = null } = scopes.includes('policies:read')
          ? parseRequest(req).single({ parser: JSON.parse }).query('get_published', 'get_unpublished')
          : { get_published: true }

        if (start_date > end_date) {
          throw new BadParamsError(`start_date ${start_date} > end_date ${end_date}`)
        }
        const policies = await db.readPolicies<PolicyTypeInfo>({ get_published, get_unpublished })
        const prev_policies: UUID[] = policies.reduce((prev_policies_acc: UUID[], policy: PInfo['Policy']) => {
          if (policy.prev_policies) {
            prev_policies_acc.push(...policy.prev_policies)
          }
          return prev_policies_acc
        }, [])
        const active = policies.filter(p => {
          // overlapping segment logic
          const p_start_date = p.start_date
          const p_end_date = p.end_date || Number.MAX_SAFE_INTEGER
          return end_date >= p_start_date && p_end_date >= start_date && !prev_policies.includes(p.policy_id)
        })

        if (active.length === 0) {
          throw new NotFoundError('No policies found!')
        }

        res.status(200).send({ version: res.locals.version, data: { policies: active } })
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }
        if (error instanceof BadParamsError) {
          return res.status(400).send({ error })
        }
        next(new ServerError(error))
      }
    }
  )

  app.get(
    pathPrefix('/policies/:policy_id'),
    async (req: PolicyApiGetPolicyRequest, res: PolicyApiGetPolicyResponse<PInfo>, next: express.NextFunction) => {
      const { policy_id } = req.params
      const { scopes } = res.locals

      try {
        if (!isUUID(policy_id)) {
          throw new BadParamsError(`policy_id ${policy_id} is not a valid UUID`)
        }

        /*
          If the client is scoped to read unpublished policies,
          they are permitted to query for both published and unpublished policies.
          Otherwise, they can only read published.
        */
        const { get_published = null, get_unpublished = null } = scopes.includes('policies:read')
          ? parseRequest(req).single({ parser: JSON.parse }).query('get_published', 'get_unpublished')
          : { get_published: true }

        const policies = await db.readPolicies({ policy_id, get_published, get_unpublished })

        if (policies.length === 0) {
          throw new NotFoundError(`policy_id ${policy_id} not found`)
        }

        const [policy] = policies

        res.status(200).send({ version: res.locals.version, data: { policy } })
      } catch (error) {
        if (error instanceof BadParamsError) {
          return res.status(400).send({ error })
        }
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }
        return next(new ServerError(error))
      }
    }
  )

  /* eslint-reason global error handling middleware */
  /* istanbul ignore next */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  app.use(async (error: Error, req: ApiRequest, res: ApiResponse, next: NextFunction) => {
    const { method, originalUrl } = req
    logger.error('Fatal MDS Policy Error (global error handling middleware)', {
      method,
      originalUrl,
      error
    })
    return res.status(500).send({ error })
  })

  return app
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function injectSchema(schema: any, app: express.Express): express.Express {
  app.get(pathPrefix('/schema/policy'), (req, res) => {
    res.status(200).send(schema)
  })
  return app
}

export { api, injectSchema }
