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
import { v4 as uuid } from 'uuid'
import db from '@mds-core/mds-db'
import {
  pathsFor,
  UUID_REGEX,
  AlreadyPublishedError,
  BadParamsError,
  DependencyMissingError,
  NotFoundError,
  ValidationError,
  ServerError,
  ConflictError
} from '@mds-core/mds-utils'
import { policyValidationDetails } from '@mds-core/mds-schema-validators'
import logger from '@mds-core/mds-logger'

import { checkAccess } from '@mds-core/mds-api-server'
import { PolicyAuthorApiVersionMiddleware } from './middleware/policy-author-api-version'
import { getPolicies } from './request-handlers'
import {
  PolicyAuthorGetPolicyResponse,
  PolicyAuthorApiRequest,
  PolicyAuthorCreatePolicyResponse,
  PolicyAuthorEditPolicyResponse,
  PolicyAuthorDeletePolicyResponse
} from './types'

function api(app: express.Express): express.Express {
  app.use(PolicyAuthorApiVersionMiddleware)
  app.get(
    pathsFor('/policies'),
    checkAccess(scopes => scopes.includes('policies:read')),
    getPolicies
  )

  app.post(
    pathsFor('/policies'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req: PolicyAuthorApiRequest, res: PolicyAuthorGetPolicyResponse) => {
      const policy = { policy_id: uuid(), ...req.body }

      const details = policyValidationDetails(policy)

      if (details != null) {
        logger.error('invalid policy json', details)
        return res.status(400).send({ error: new ValidationError(JSON.stringify(details)) })
      }

      try {
        await db.writePolicy(policy)
        return res.status(201).send({ version: res.locals.version, policy })
      } catch (err) {
        if (err.code === '23505') {
          return res
            .status(409)
            .send({ error: new ConflictError(`policy ${policy.policy_id} already exists! Did you mean to PUT?`) })
        }
        /* istanbul ignore next */
        logger.error('failed to write policy', err)
        /* istanbul ignore next */
        return res.status(500).send({ error: new ServerError(err) })
      }
    }
  )

  app.post(
    pathsFor('/policies/:policy_id/publish'),
    checkAccess(scopes => scopes.includes('policies:publish')),
    async (req: PolicyAuthorApiRequest, res: PolicyAuthorCreatePolicyResponse) => {
      const { policy_id } = req.params
      try {
        await db.publishPolicy(policy_id)
        return res
          .status(200)
          .send({ version: res.locals.version, result: `successfully published policy of id ${policy_id}` })
      } catch (error) {
        logger.error('failed to publish policy', error.stack)
        if (error instanceof AlreadyPublishedError) {
          return res.status(409).send({ error })
        }
        return res.status(404).send({ error })
      }
    }
  )

  app.put(
    pathsFor('/policies/:policy_id'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req: PolicyAuthorApiRequest, res: PolicyAuthorEditPolicyResponse) => {
      const policy = req.body

      const details = policyValidationDetails(policy)

      if (details != null) {
        logger.error('invalid policy json', details)
        return res.status(400).send({ error: new ValidationError(JSON.stringify(details)) })
      }

      try {
        await db.editPolicy(policy)
        const result = await db.readPolicy(policy.policy_id)
        return res.status(200).send({ version: res.locals.version, policy: result })
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }
        if (error instanceof AlreadyPublishedError) {
          return res.status(409).send({ error })
        }
        /* istanbul ignore next */
        logger.error('failed to edit policy', error.stack)
        /* istanbul ignore next */
        return res.status(500).send({ error: new ServerError(error) })
      }
    }
  )

  app.delete(
    pathsFor('/policies/:policy_id'),
    checkAccess(scopes => scopes.includes('policies:delete')),
    async (req: PolicyAuthorApiRequest, res: PolicyAuthorDeletePolicyResponse) => {
      const { policy_id } = req.params
      try {
        await db.deletePolicy(policy_id)
        return res.status(200).send({ version: res.locals.version, policy_id })
      } catch (error) {
        /* istanbul ignore next */
        logger.error('failed to delete policy', error.stack)
        /* istanbul ignore next */
        return res.status(404).send({ error })
      }
    }
  )

  app.get(
    pathsFor('/policies/meta/'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const { get_published = null, get_unpublished = null } = req.query
      const params = { get_published, get_unpublished }
      if (get_published) {
        params.get_published = get_published === 'true'
      }
      if (get_unpublished) {
        params.get_unpublished = get_unpublished === 'true'
      }

      logger.info('read /policies/meta', req.query)
      try {
        const policy_metadata = await db.readBulkPolicyMetadata(params)

        res.status(200).send({ version: res.locals.version, policy_metadata })
      } catch (err) {
        logger.error('failed to read policies', err)
        if (err instanceof BadParamsError) {
          res.status(400).send({
            result:
              'Cannot set both get_unpublished and get_published to be true. If you want all policy metadata, set both params to false or do not send them.'
          })
        }
        res.status(404).send({
          result: 'not found'
        })
      }
    }
  )

  app.get(
    pathsFor('/policies/:policy_id'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const { policy_id } = req.params
      try {
        const policies = await db.readPolicies({ policy_id })
        if (policies.length > 0) {
          res.status(200).send({ version: res.locals.version, policy: policies[0] })
        } else {
          res.status(404).send({ result: 'not found' })
        }
      } catch (err) {
        logger.error('failed to read one policy', err)
        res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.get(
    pathsFor('/policies/:policy_id/meta'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const { policy_id } = req.params
      try {
        const result = await db.readSinglePolicyMetadata(policy_id)
        return res.status(200).send({ version: res.locals.version, policy_metadata: result })
      } catch (err) {
        logger.error('failed to read policy metadata', err.stack)
        return res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.put(
    pathsFor('/policies/:policy_id/meta'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const policy_metadata = req.body
      try {
        await db.updatePolicyMetadata(policy_metadata)
        return res.status(200).send({ version: res.locals.version, policy_metadata })
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          try {
            await db.writePolicyMetadata(policy_metadata)
            return res.status(201).send({ version: res.locals.version, policy_metadata })
          } catch (writeErr) {
            logger.error('failed to write policy metadata', writeErr.stack)
            return res.status(500).send(new ServerError())
          }
        } else {
          return res.status(500).send(new ServerError())
        }
      }
    }
  )

  return app
}

export { api }
