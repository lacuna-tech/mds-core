import express from 'express'
import db from '@mds-core/mds-db'

import { pathsFor, ServerError, NotFoundError, DependencyMissingError } from '@mds-core/mds-utils'
import { geographyValidationDetails } from '@mds-core/mds-schema-validators'
import log from '@mds-core/mds-logger'

import { checkAccess } from '@mds-core/mds-api-server'

function api(app: express.Express): express.Express {
  app.get(
    pathsFor('/geographies/meta/'),
    checkAccess(scopes => scopes.includes('policies:read')),
    async (req, res) => {
      const get_read_only = req.query.get_read_only === 'true'

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
      try {
        const geography = await db.readSingleGeography(geography_id)
        res.status(200).send(geography)
      } catch (err) {
        await log.error('failed to read geography', err.stack)
        if (err instanceof NotFoundError) {
          return res.status(404).send({ result: 'not found' })
        }
        return res.status(500).send(new ServerError())
      }
    }
  )

  app.post(
    pathsFor('/geographies/'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const geography = req.body
      const details = geographyValidationDetails(geography)

      if (details) {
        await log.error('invalid policy json', details)
        return res.status(400).send(details)
      }

      try {
        const recorded_geography = await db.writeGeography(geography)
        return res.status(201).send(recorded_geography)
      } catch (err) {
        await log.error('failed to write geography', err.stack)
        if (err.code === '23505') {
          return res
            .status(409)
            .send({ result: `geography ${geography.geography_id} already exists! Did you mean to PUT?` })
        }
        /* istanbul ignore next */
        /* istanbul ignore next */
        return res.status(500).send(new ServerError())
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const geography = req.body
      const details = geographyValidationDetails(geography)

      if (details) {
        await log.error('invalid policy json', details)
        return res.status(400).send(details)
      }

      try {
        await db.editGeography(geography)
        return res.status(201).send(geography)
      } catch (err) {
        await log.error('failed to edit geography', err.stack)
        if (err instanceof NotFoundError) {
          return res.status(404).send({ result: 'not found' })
        }
        return res.status(500).send(new ServerError(err))
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
        if (err instanceof NotFoundError) {
          return res.status(404).send({ result: 'geography either not found or already published' })
        }
        return res.status(500).send(new ServerError())
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
        if (err instanceof NotFoundError) {
          return res.status(404).send({ result: 'not found' })
        }
        return res.status(500).send(new ServerError())
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
        // We don't throw a NotFoundError if the number of results is zero, so the error handling
        // doesn't need to consider it here.
        await log.error('failed to read geographies', err.stack)
        return res.status(500).send({ result: 'geographies are unavailable' })
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id/meta'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const geography_metadata = req.body
      const { geography_id } = req.params
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
            if (writeErr instanceof DependencyMissingError) {
              return res.status(400).send({ result: `no geography found for ${geography_id}` })
            }
            return res.status(500).send(new ServerError())
          }
        } else {
          return res.status(500).send(new ServerError())
        }
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id/publish'),
    checkAccess(scopes => scopes.includes('policies:write')),
    async (req, res) => {
      const { geography_id } = req.params
      try {
        await db.publishGeography({ geography_id })
        const published_geo = await db.readSingleGeography(geography_id)
        return res.status(200).send(published_geo)
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          return res.status(400).send({ result: `unable to find geography of ${geography_id}` })
        }
        return res.status(500).send(new ServerError())
      }
    }
  )

  return app
}

export { api }
