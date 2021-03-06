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

import { AccessTokenScopeValidator, ApiRequest, ApiResponse, checkAccess } from '@mds-core/mds-api-server'
import db from '@mds-core/mds-db'
import logger from '@mds-core/mds-logger'
import { PolicyMetadata, PolicyTypeInfo } from '@mds-core/mds-types'
import {
  AlreadyPublishedError,
  BadParamsError,
  ConflictError,
  isDefined,
  isUUID,
  NotFoundError,
  pathPrefix,
  ServerError,
  uuid,
  ValidationError
} from '@mds-core/mds-utils'
import express, { NextFunction } from 'express'
import HttpStatus from 'http-status-codes'
import { PolicyAuthorApiVersionMiddleware } from './policy-author-api-version'
import {
  PolicyAuthorApiAccessTokenScopes,
  PolicyAuthorApiDeletePolicyRequest,
  PolicyAuthorApiDeletePolicyResponse,
  PolicyAuthorApiEditPolicyMetadataRequest,
  PolicyAuthorApiEditPolicyMetadataResponse,
  PolicyAuthorApiEditPolicyRequest,
  PolicyAuthorApiEditPolicyResponse,
  PolicyAuthorApiGetPolicyMetadataRequest,
  PolicyAuthorApiGetPolicyMetadataResponse,
  PolicyAuthorApiGetPolicyMetadatumRequest,
  PolicyAuthorApiGetPolicyMetadatumResponse,
  PolicyAuthorApiPostPolicyRequest,
  PolicyAuthorApiPostPolicyResponse,
  PolicyAuthorApiPublishPolicyRequest,
  PolicyAuthorApiPublishPolicyResponse
} from './types'

const checkPolicyAuthorApiAccess = (validator: AccessTokenScopeValidator<PolicyAuthorApiAccessTokenScopes>) =>
  checkAccess(validator)

function api<PInfo extends PolicyTypeInfo>(app: express.Express): express.Express {
  app.use(PolicyAuthorApiVersionMiddleware)
  app.post(
    pathPrefix('/policies'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:write')),
    async (
      req: PolicyAuthorApiPostPolicyRequest<PInfo>,
      res: PolicyAuthorApiPostPolicyResponse<PInfo>,
      next: express.NextFunction
    ) => {
      if (!isDefined(req.body.policy_id)) {
        req.body.policy_id = uuid()
      }
      const policy = req.body
      logger.info('posting policy', policy)

      if (policy.publish_date) {
        return next(
          new ValidationError('publish_date cannot be set via policy creation endpoint', {
            details:
              'publish_date cannot be set via policy creation endpoint. publish_date can only be set via the publishing endpoint'
          })
        )
      }

      try {
        await db.writePolicy(policy as PInfo['Policy'])
        return res.status(201).send({ version: res.locals.version, data: { policy } })
      } catch (error) {
        if (error instanceof ConflictError) {
          return res.status(409).send({ error })
        }
        /* istanbul ignore next */
        return next(new ServerError(error))
      }
    }
  )

  app.post(
    pathPrefix('/policies/:policy_id/publish'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:publish')),
    async (
      req: PolicyAuthorApiPublishPolicyRequest,
      res: PolicyAuthorApiPublishPolicyResponse<PInfo>,
      next: express.NextFunction
    ) => {
      const { policy_id } = req.params
      try {
        const policy = await db.publishPolicy(policy_id)
        return res.status(200).send({ version: res.locals.version, data: { policy } })
      } catch (error) {
        logger.error('failed to publish policy', error.stack)
        switch (error.constructor.name) {
          case 'AlreadyPublishedError': {
            return res.status(409).send({ error })
          }
          case 'NotFoundError': {
            return res.status(404).send({ error })
          }
          case 'DependencyMissingError': {
            return res.status(424).send({ error })
          }
          case 'ConflictError': {
            return res.status(409).send({ error })
          }
          default: {
            return next(new ServerError(error))
          }
        }
      }
    }
  )

  app.put(
    pathPrefix('/policies/:policy_id'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:write')),
    async (
      req: PolicyAuthorApiEditPolicyRequest,
      res: PolicyAuthorApiEditPolicyResponse<PInfo>,
      next: express.NextFunction
    ) => {
      const policy = req.body

      if (policy.publish_date) {
        return next(
          new ValidationError('publish_date cannot be set via policy editing endpoint', {
            details:
              'publish_date cannot be set via policy editing endpoint. publish_date can only be set via the publishing endpoint'
          })
        )
      }

      if (policy.publish_date) {
        return res.status(400).send({ error: new ValidationError('publish_date must be set via publish endpoint') })
      }

      try {
        await db.editPolicy(policy)
        const result = await db.readPolicy(policy.policy_id)
        return res.status(200).send({ version: res.locals.version, data: { policy: result } })
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }
        if (error instanceof AlreadyPublishedError) {
          return res.status(409).send({ error })
        }
        /* istanbul ignore next */
        return next(new ServerError(error))
      }
    }
  )

  app.delete(
    pathPrefix('/policies/:policy_id'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:delete')),
    async (
      req: PolicyAuthorApiDeletePolicyRequest,
      res: PolicyAuthorApiDeletePolicyResponse,
      next: express.NextFunction
    ) => {
      const { policy_id } = req.params
      try {
        await db.deletePolicy(policy_id)
        return res.status(200).send({ version: res.locals.version, data: { policy_id } })
      } catch (error) {
        /* istanbul ignore next */
        logger.error('failed to delete policy', error.stack)
        /* istanbul ignore next */
        return res.status(404).send({ error })
        /* FIXME: Potential server-errors are caught and handled as a 404, need to add explicit error handling */
      }
    }
  )

  app.get(
    pathPrefix('/policies/meta/'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:read')),
    async (
      req: PolicyAuthorApiGetPolicyMetadataRequest,
      res: PolicyAuthorApiGetPolicyMetadataResponse,
      next: express.NextFunction
    ) => {
      const { get_published, get_unpublished } = req.query
      const params = {
        get_published: get_published ? get_published === 'true' : null,
        get_unpublished: get_unpublished ? get_unpublished === 'true' : null
      }

      try {
        const policy_metadata = await db.readBulkPolicyMetadata(params)

        if (policy_metadata.length === 0) {
          throw new NotFoundError('No metadata found')
        }

        res.status(200).send({ version: res.locals.version, data: { policy_metadata } })
      } catch (error) {
        if (error instanceof BadParamsError) {
          res.status(400).send({
            error:
              'Cannot set both get_unpublished and get_published to be true. If you want all policy metadata, set both params to false or do not send them.'
          })
        }
        if (error instanceof NotFoundError) {
          res.status(404).send({
            error
          })
        }
        /* istanbul ignore next */
        return next(new ServerError(error))
      }
    }
  )

  app.get(
    pathPrefix('/policies/:policy_id/meta'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:read')),
    async (
      req: PolicyAuthorApiGetPolicyMetadatumRequest,
      res: PolicyAuthorApiGetPolicyMetadatumResponse,
      next: express.NextFunction
    ) => {
      const { policy_id } = req.params

      try {
        if (!isUUID(policy_id)) {
          throw new BadParamsError(`${policy_id} is not a valid UUID`)
        }

        const result = await db.readSinglePolicyMetadata(policy_id)
        return res.status(200).send({ version: res.locals.version, data: { policy_metadata: result } })
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }
        if (error instanceof BadParamsError) {
          return res.status(400).send({ error })
        }
        /* istanbul ignore next */
        return next(new ServerError(error))
      }
    }
  )

  app.put(
    pathPrefix('/policies/:policy_id/meta'),
    checkPolicyAuthorApiAccess(scopes => scopes.includes('policies:write')),
    async (
      req: PolicyAuthorApiEditPolicyMetadataRequest,
      res: PolicyAuthorApiEditPolicyMetadataResponse,
      next: express.NextFunction
    ) => {
      const policy_metadata = req.body
      try {
        await db.updatePolicyMetadata(policy_metadata as PolicyMetadata)
        return res.status(200).send({ version: res.locals.version, data: { policy_metadata } })
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          try {
            await db.writePolicyMetadata(policy_metadata)
            return res.status(201).send({ version: res.locals.version, data: { policy_metadata } })
          } catch (writeErr) {
            /* istanbul ignore next */
            return next(new ServerError(writeErr))
          }
        }
        /* istanbul ignore next */
        return next(new ServerError(updateErr))
      }
    }
  )

  /* eslint-reason global error handling middleware */
  /* istanbul ignore next */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  app.use(async (error: Error, req: ApiRequest, res: ApiResponse, next: NextFunction) => {
    const { method, originalUrl } = req
    await logger.error('Fatal MDS Policy Author Error (global error handling middleware)', {
      method,
      originalUrl,
      error
    })
    if (error instanceof ValidationError && error.info) return res.status(HttpStatus.BAD_REQUEST).send({ error })
    return res.status(500).send({ error })
  })

  return app
}

export { api }
