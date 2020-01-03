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
import uuid from 'uuid'
import db from '@mds-core/mds-db'
import {
  pathsFor,
  ServerError,
  UUID_REGEX,
  NotFoundError,
  BadParamsError,
  AlreadyPublishedError
} from '@mds-core/mds-utils'
import { policyValidationDetails, geographyValidationDetails } from '@mds-core/mds-schema-validators'
import log from '@mds-core/mds-logger'

import { checkAccess } from '@mds-core/mds-api-server'
import { getPolicies } from './request-handlers'

function api(app: express.Express): express.Express {
  app.get(
    pathsFor('/policies'),
    checkAccess(scopes => scopes.includes('policies:read')),
    getPolicies
  )

  app.post(
    pathsFor('/policies'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const policy = { policy_id: uuid(), ...req.body }

      const details = policyValidationDetails(policy)

      if (details != null) {
        await log.error('invalid policy json', details)
        return res.status(400).send(details)
      }

      try {
        await db.writePolicy(policy)
        return res.status(201).send(policy)
      } catch (err) {
        if (err.code === '23505') {
          return res.status(409).send({ result: `policy ${policy.policy_id} already exists! Did you mean to PUT?` })
        }
        /* istanbul ignore next */
        await log.error('failed to write policy', err)
        /* istanbul ignore next */
        return res.status(500).send({ error: new ServerError(err) })
      }
    }
  )

  app.post(
    pathsFor('/policies/:policy_id/publish'),
    checkAccess(scopes => scopes.includes('policies:publish')),
    async (req, res) => {
      const { policy_id } = req.params
      try {
        await db.publishPolicy(policy_id)
        return res.status(200).send({ result: `successfully published policy of id ${policy_id}` })
      } catch (err) {
        if (err instanceof NotFoundError) {
          if (err.message.includes('geography')) {
            const geography_id = err.message.match(UUID_REGEX)
            return res.status(404).send({ error: `geography_id ${geography_id} not_found` })
          }
          if (err.message.includes('policy')) {
            return res.status(404).send({ error: `policy_id ${policy_id} not_found` })
          }
        }
        if (err instanceof AlreadyPublishedError) {
          return res.status(409).send({ error: `policy_id ${policy_id} has already been published` })
        }
        /* istanbul ignore next */
        await log.error('failed to publish policy', err.stack)
        /* istanbul ignore next */
        return res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.put(
    pathsFor('/policies/:policy_id'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const policy = req.body

      const details = policyValidationDetails(policy)

      if (details != null) {
        await log.error('invalid policy json', details)
        return res.status(400).send(details)
      }

      try {
        await db.editPolicy(policy)
        return res.status(200).send({ result: `successfully edited policy ${policy}` })
      } catch (err) {
        if (err instanceof NotFoundError) {
          return res.status(404).send({ error: 'not found' })
        }
        if (err instanceof AlreadyPublishedError) {
          return res.status(409).send({ error: `policy ${policy.policy_id} has already been published!` })
        }
        /* istanbul ignore next */
        await log.error('failed to edit policy', err.stack)
        /* istanbul ignore next */
        if (err instanceof NotFoundError) {
          res.status(404).send({ result: 'not found' })
        } else {
          res.status(500).send(new ServerError(err))
        }
      }
    }
  )

  app.delete(
    pathsFor('/policies/:policy_id'),
    checkAccess(scopes => scopes.includes('policies:delete')),
    async (req, res) => {
      const { policy_id } = req.params
      try {
        await db.deletePolicy(policy_id)
        return res.status(200).send({ result: `successfully deleted policy of id ${policy_id}` })
      } catch (err) {
        /* istanbul ignore next */
        await log.error('failed to delete policy', err.stack)
        /* istanbul ignore next */
        return res.status(404).send({ result: 'policy either not found, or has already been published' })
      }
    }
  )

  app.get(
    pathsFor('/policies/meta/'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const { get_published = null, get_unpublished = null } = req.query
      log.info('read /policies/meta', req.query)
      try {
        const metadata = await db.readBulkPolicyMetadata({ get_published, get_unpublished })

        res.status(200).send(metadata)
      } catch (err) {
        await log.error('failed to read policies', err)
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
          res.status(200).send(policies[0])
        } else {
          res.status(404).send({ result: 'not found' })
        }
      } catch (err) {
        await log.error('failed to read one policy', err)
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
        return res.status(200).send(result)
      } catch (err) {
        await log.error('failed to read policy metadata', err.stack)
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
        return res.status(200).send(policy_metadata)
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          try {
            await db.writePolicyMetadata(policy_metadata)
            return res.status(201).send(policy_metadata)
          } catch (writeErr) {
            await log.error('failed to write policy metadata', writeErr.stack)
            return res.status(500).send(new ServerError())
          }
        } else {
          return res.status(500).send(new ServerError())
        }
      }
    }
  )

  app.get(
    pathsFor('/geographies/meta/'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const get_read_only = req.query === 'true'

      log.info('read /geographies/meta', req.query)
      try {
        const metadata = await db.readBulkGeographyMetadata({ get_read_only })
        res.status(200).send(metadata)
      } catch (err) {
        await log.error('failed to read geography metadata', err)
        res.status(404).send({
          result: 'not found'
        })
      }
    }
  )

  app.get(
    pathsFor('/geographies/:geography_id'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      log.info('read geo', JSON.stringify(req.params))
      const { geography_id } = req.params
      log.info('read geo', geography_id)
      try {
        const geography = await db.readSingleGeography(geography_id)
        res.status(200).send(geography)
      } catch (err) {
        await log.error('failed to read geography', err.stack)
        res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.post(
    pathsFor('/geographies/'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const geography = req.body
      const details = geographyValidationDetails(geography)

      if (details != null) {
        await log.error('invalid policy json', details)
        return res.status(400).send(details)
      }

      try {
        await db.writeGeography(geography)
        return res.status(201).send(geography)
      } catch (err) {
        if (err.code === '23505') {
          return res
            .status(409)
            .send({ result: `geography ${geography.geography_id} already exists! Did you mean to PUT?` })
        }
        /* istanbul ignore next */
        await log.error('failed to write geography', err.stack)
        /* istanbul ignore next */
        return res.status(500).send(new ServerError(err))
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const geography = req.body
      const details = geographyValidationDetails(geography)

      if (details != null) {
        await log.error('invalid policy json', details)
        return res.status(400).send(details)
      }

      try {
        await db.editGeography(geography)
        return res.status(201).send(geography)
      } catch (err) {
        await log.error('failed to write geography', err.stack)
        return res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.delete(
    pathsFor('/geographies/:geography_id'),
    checkAccess(scopes => scopes.includes('policies:delete')),
    async (req, res) => {
      const { geography_id } = req.params
      try {
        await db.deleteGeography(geography_id)
        return res.status(200).send({ result: `Successfully deleted geography of id ${geography_id}` })
      } catch (err) {
        await log.error('failed to delete geography', err.stack)
        return res.status(404).send({ result: 'geography either not found or already published' })
      }
    }
  )

  app.get(
    pathsFor('/geographies/:geography_id/meta'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const { geography_id } = req.params
      try {
        const geography_metadata = await db.readSingleGeographyMetadata(geography_id)
        return res.status(200).send(geography_metadata)
      } catch (err) {
        await log.error('failed to read geography metadata', err.stack)
        return res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.get(
    pathsFor('/geographies'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const summary = req.query.summary === 'true'
      try {
        const geographies = summary ? await db.readGeographySummaries() : await db.readGeographies()
        return res.status(200).send(geographies)
      } catch (err) {
        await log.error('failed to read geographies', err.stack)
        return res.status(404).send({ result: 'not found' })
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id/meta'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const geography_metadata = req.body
      try {
        await db.updateGeographyMetadata(geography_metadata)
        return res.status(200).send(geography_metadata)
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          try {
            await db.writeGeographyMetadata(geography_metadata)
            return res.status(201).send(geography_metadata)
          } catch (writeErr) {
            await log.error('failed to write geography metadata', writeErr.stack)
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
