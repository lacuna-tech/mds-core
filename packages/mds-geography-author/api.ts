import express from 'express'
import db from '@mds-core/mds-db'

import {
  pathsFor,
  ServerError,
  NotFoundError,
  DependencyMissingError,
  ValidationError,
  AlreadyPublishedError,
  InsufficientPermissionsError,
  BadParamsError
} from '@mds-core/mds-utils'
import { geographyValidationDetails } from '@mds-core/mds-schema-validators'
import logger from '@mds-core/mds-logger'

import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { GeographyAuthorApiVersionMiddleware } from './middleware'
import {
  GeographyAuthorApiRequest,
  GeographyAuthorApiAccessTokenScopes,
  GetGeographyMetadataResponse,
  GetGeographyResponse,
  GetGeographiesResponse,
  DeleteGeographyResponse,
  PostGeographyResponse,
  PutGeographyResponse,
  PutGeographyMetadataResponse,
  GetGeographyMetadatumResponse
} from './types'

const checkGeographyAuthorApiAccess = (validator: AccessTokenScopeValidator<GeographyAuthorApiAccessTokenScopes>) =>
  checkAccess(validator)

function api(app: express.Express): express.Express {
  app.use(GeographyAuthorApiVersionMiddleware)

  app.get(
    pathsFor('/geographies/meta/'),
    checkGeographyAuthorApiAccess(scopes => {
      return scopes.includes('geographies:read:published') || scopes.includes('geographies:read:unpublished')
    }),
    async (req: GeographyAuthorApiRequest, res: GetGeographyMetadataResponse) => {
      const { scopes } = res.locals
      const { get_published, get_unpublished } = req.query
      const params = {
        get_published: get_published ? get_published === 'true' : null,
        get_unpublished: get_unpublished ? get_unpublished === 'true' : null
      }

      /* If the user can only read published geos, and all they want is the unpublished metadata,
       * throw a permissions error.
       */
      try {
        if (!scopes.includes('geographies:read:unpublished') && params.get_unpublished) {
          throw new InsufficientPermissionsError(
            'Cannot require unpublished geo metadata without geography:read:unpublished scope'
          )
        }

        /* If the user has only the read:published scope, they should not be allowed to see
         * unpublished geos. If they didn't supply any params, we modify them here so as to
         * filter only for published geo metadata. We have to monkey with the params here
         * in a way that we don't for the bulk read of the geographies since we can't filter
         * the DB results in this layer, since metadata has no idea if the geo it's associated
         * with is published or not.
         */
        if (
          !scopes.includes('geographies:read:unpublished') &&
          params.get_unpublished === null &&
          params.get_published === null
        ) {
          params.get_published = true
        }
        const geography_metadata = await db.readBulkGeographyMetadata(params)
        return res.status(200).send({ version: res.locals.version, geography_metadata })
      } catch (error) {
        logger.error('failed to read geography metadata', error)
        /* This error is thrown if both get_published and get_unpublished are set.
         * To get all geos, neither parameter should be set.
         */
        if (error instanceof BadParamsError) {
          return res.status(400).send({ error })
        }
        if (error instanceof InsufficientPermissionsError) {
          return res.status(403).send({ error })
        }
        return res.status(500).send({ error })
      }
    }
  )

  app.get(
    pathsFor('/geographies/:geography_id'),
    checkGeographyAuthorApiAccess(scopes => {
      return scopes.includes('geographies:read:published') || scopes.includes('geographies:read:unpublished')
    }),
    async (req: GeographyAuthorApiRequest, res: GetGeographyResponse) => {
      const { geography_id } = req.params
      try {
        const geography = await db.readSingleGeography(geography_id)
        if (!geography.publish_date && !res.locals.scopes.includes('geographies:read:unpublished')) {
          throw new InsufficientPermissionsError('permission to read unpublished geographies missing')
        }
        return res.status(200).send({ version: res.locals.version, geography })
      } catch (err) {
        logger.error('failed to read geography', err.stack)
        if (err instanceof NotFoundError) {
          return res.status(404).send({ error: err })
        }

        if (err instanceof InsufficientPermissionsError) {
          return res.status(403).send({ error: err })
        }

        return res.status(500).send({ error: new ServerError() })
      }
    }
  )

  app.get(
    pathsFor('/geographies'),
    checkGeographyAuthorApiAccess(scopes => {
      return scopes.includes('geographies:read:published') || scopes.includes('geographies:read:unpublished')
    }),
    async (req: GeographyAuthorApiRequest, res: GetGeographiesResponse) => {
      const summary = req.query.summary === 'true'
      const { get_published, get_unpublished } = req.query
      const params = {
        get_published: get_published ? get_published === 'true' : null,
        get_unpublished: get_unpublished ? get_unpublished === 'true' : null
      }

      try {
        if (!res.locals.scopes.includes('geographies:read:unpublished') && params.get_unpublished) {
          throw new InsufficientPermissionsError(
            'Cannot require unpublished geos without geography:read:unpublished scope'
          )
        }

        const geographies = summary ? await db.readGeographySummaries(params) : await db.readGeographies(params)
        if (!res.locals.scopes.includes('geographies:read:unpublished')) {
          const filteredGeos = geographies.filter(geo => !!geo.publish_date)
          return res.status(200).send({ version: res.locals.version, geographies: filteredGeos })
        }
        return res.status(200).send({ version: res.locals.version, geographies })
      } catch (error) {
        /* We don't throw a NotFoundError if the number of results is zero, so the error handling
         * doesn't need to consider it here.
         */
        if (error instanceof InsufficientPermissionsError) {
          return res.status(403).send({ error })
        }
        logger.error('failed to read geographies', error.stack)
        return res.status(500).send({ error: new ServerError() })
      }
    }
  )

  app.post(
    pathsFor('/geographies/'),
    checkGeographyAuthorApiAccess(scopes => scopes.includes('geographies:write')),
    async (req: GeographyAuthorApiRequest, res: PostGeographyResponse) => {
      const geography = req.body

      try {
        const details = geographyValidationDetails(geography)
        if (details) {
          throw new ValidationError(JSON.stringify(details))
        }

        const recorded_geography = await db.writeGeography(geography)
        return res.status(201).send({ version: res.locals.version, geography: recorded_geography })
      } catch (err) {
        logger.error('POST /geographies failed', err.stack)
        if (err.code === '23505') {
          return res
            .status(409)
            .send({ error: `geography ${geography.geography_id} already exists! Did you mean to PUT?` })
        }
        if (err instanceof ValidationError) {
          return res.status(400).send({ error: err })
        }
        /* istanbul ignore next */
        /* istanbul ignore next */
        return res.status(500).send({ error: err })
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id'),
    checkGeographyAuthorApiAccess(scopes => scopes.includes('geographies:write')),
    async (req: GeographyAuthorApiRequest, res: PutGeographyResponse) => {
      const geography = req.body
      try {
        const details = geographyValidationDetails(geography)
        if (details) {
          throw new ValidationError(JSON.stringify(details))
        }
        await db.editGeography(geography)
        return res.status(201).send({ version: res.locals.version, geography })
      } catch (error) {
        logger.error('failed to edit geography', error.stack)
        if (error instanceof NotFoundError) {
          return res.status(404).send({ error })
        }
        if (error instanceof ValidationError) {
          return res.status(400).send({ error })
        }
        return res.status(500).send({ error })
      }
    }
  )

  app.delete(
    pathsFor('/geographies/:geography_id'),
    checkGeographyAuthorApiAccess(scopes => scopes.includes('geographies:write')),
    async (req: GeographyAuthorApiRequest, res: DeleteGeographyResponse) => {
      const { geography_id } = req.params
      try {
        const isPublished = await db.isGeographyPublished(geography_id)
        if (isPublished) {
          throw new AlreadyPublishedError('Cannot delete an already published geography')
        }
        try {
          await db.deleteGeographyMetadata(geography_id)
        } catch (err) {
          /* No reason to let this bubble up. It's legit for metadata to not exist, and it
           * seems wrong to throw an error for deleting metadata when this endpoint is mainly
           * about deleting geographies.
           */
          logger.info(`Unable to delete nonexistent metadata for ${geography_id}`)
        }
        await db.deleteGeography(geography_id)
        return res.status(200).send({
          version: res.locals.version,
          result: `Successfully deleted geography and/or geography metadata of id ${geography_id}`
        })
      } catch (err) {
        logger.error('failed to delete geography', err.stack)
        if (err instanceof NotFoundError) {
          return res.status(404).send({ error: err })
        }
        if (err instanceof AlreadyPublishedError) {
          return res.status(405).send({ error: err })
        }
        return res.status(500).send({ error: err })
      }
    }
  )

  app.get(
    pathsFor('/geographies/:geography_id/meta'),
    checkGeographyAuthorApiAccess(scopes => {
      return scopes.includes('geographies:read:published') || scopes.includes('geographies:read:unpublished')
    }),
    async (req: GeographyAuthorApiRequest, res: GetGeographyMetadatumResponse) => {
      const { geography_id } = req.params
      try {
        const geography_metadata = await db.readSingleGeographyMetadata(geography_id)
        const geography = await db.readSingleGeography(geography_id)
        if (!geography.publish_date && !res.locals.scopes.includes('geographies:read:unpublished')) {
          throw new InsufficientPermissionsError('permission to read metadata of unpublished geographies missing')
        }
        return res.status(200).send({ version: res.locals.version, geography_metadata })
      } catch (err) {
        logger.error('failed to read geography metadata', err.stack)
        if (err instanceof NotFoundError) {
          return res.status(404).send({ error: err })
        }
        if (err instanceof InsufficientPermissionsError) {
          return res.status(403).send({ error: err })
        }
        return res.status(500).send({ error: new ServerError() })
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id/meta'),
    checkGeographyAuthorApiAccess(scopes => scopes.includes('geographies:write')),
    async (req: GeographyAuthorApiRequest, res: PutGeographyMetadataResponse) => {
      const geography_metadata = req.body
      try {
        await db.updateGeographyMetadata(geography_metadata)
        return res.status(200).send(geography_metadata)
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          try {
            await db.writeGeographyMetadata(geography_metadata)
            return res.status(201).send({ version: res.locals.version, geography_metadata })
          } catch (writeErr) {
            logger.error('failed to write geography metadata', writeErr.stack)
            if (writeErr instanceof DependencyMissingError) {
              return res.status(404).send({ error: writeErr })
            }
            return res.status(500).send({ error: new ServerError() })
          }
        } else {
          return res.status(500).send({ error: new ServerError() })
        }
      }
    }
  )

  app.put(
    pathsFor('/geographies/:geography_id/publish'),
    checkGeographyAuthorApiAccess(scopes => scopes.includes('geographies:publish')),
    async (req: GeographyAuthorApiRequest, res: PutGeographyResponse) => {
      const { geography_id } = req.params
      try {
        await db.publishGeography({ geography_id })
        const published_geo = await db.readSingleGeography(geography_id)
        return res.status(200).send({ version: res.locals.version, geography: published_geo })
      } catch (updateErr) {
        if (updateErr instanceof NotFoundError) {
          return res.status(404).send({ error: `unable to find geography of ${geography_id}` })
        }
        return res.status(500).send({ error: new ServerError() })
      }
    }
  )

  return app
}

export { api }
