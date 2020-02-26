/*
    Copyright 2019-2020 City of Los Angeles.

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
import { pathsFor, ServerError, NotFoundError, ValidationError, ConflictError } from '@mds-core/mds-utils'
import { checkAccess } from '@mds-core/mds-api-server'
import { JurisdictionService } from '@mds-core/mds-jurisdiction-service'
import {
  JurisdictionApiGetJurisdictionsRequest,
  JurisdictionApiGetJurisdictionsResponse,
  JurisdictionApiCurrentVersion,
  JurisdictionApiCreateJurisdictionRequest,
  JurisdictionApiCreateJurisdictionResponse,
  JurisdictionApiGetJurisdictionResponse,
  JurisdictionApiGetJurisdictionRequest
} from './types'

const UnexpectedServiceError = (error: ServerError | null) =>
  error instanceof ServerError ? error : new ServerError('Unexected Service Error', { error })

function api(app: express.Express): express.Express {
  app.get(
    pathsFor('/jurisdictions'),
    checkAccess(scopes => scopes.includes('jurisdictions:read') || scopes.includes('jurisdictions:read:agency')),
    async (req: JurisdictionApiGetJurisdictionsRequest, res: JurisdictionApiGetJurisdictionsResponse) => {
      const { effective } = req.query

      const [error, result] = await JurisdictionService.getAllJurisdictions({
        effective: effective ? Number(effective) : undefined
      })

      // Handle result
      if (result) {
        return res.status(200).send({
          version: JurisdictionApiCurrentVersion,
          jurisdictions: result
        })
      }

      // Handle errors
      return res.status(500).send({ error: UnexpectedServiceError(error) })
    }
  )

  app.get(
    pathsFor('/jurisdictions/:jurisdiction_id'),
    checkAccess(scopes => scopes.includes('jurisdictions:read') || scopes.includes('jurisdictions:read:agency')),
    async (req: JurisdictionApiGetJurisdictionRequest, res: JurisdictionApiGetJurisdictionResponse) => {
      const { effective } = req.query
      const { jurisdiction_id } = req.params

      const [error, result] = await JurisdictionService.getOneJurisdiction(jurisdiction_id, {
        effective: effective ? Number(effective) : undefined
      })

      // Handle result
      if (result) {
        return res.status(200).send({
          version: JurisdictionApiCurrentVersion,
          jurisdiction: result
        })
      }

      // Handle errors
      if (error instanceof NotFoundError) {
        return res.status(404).send({ error })
      }

      return res.status(500).send({ error: UnexpectedServiceError(error) })
    }
  )

  app.post(
    pathsFor('/jurisdictions'),
    checkAccess(scopes => scopes.includes('jurisdictions:write')),
    async (req: JurisdictionApiCreateJurisdictionRequest, res: JurisdictionApiCreateJurisdictionResponse) => {
      const [error, result] = await JurisdictionService.createJurisdictions(
        Array.isArray(req.body) ? req.body : [req.body]
      )

      // Handle result
      if (result) {
        return Array.isArray(req.body)
          ? res.status(201).send({ version: JurisdictionApiCurrentVersion, jurisdictions: result })
          : res.status(201).send({ version: JurisdictionApiCurrentVersion, jurisdiction: result[0] })
      }

      // Handle errors
      if (error instanceof ValidationError) {
        return res.status(400).send({ error })
      }
      if (error instanceof ConflictError) {
        return res.status(409).send({ error })
      }

      return res.status(500).send({ error: UnexpectedServiceError(error) })
    }
  )

  return app
}

export { api }
