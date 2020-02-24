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
import { pathsFor, ServerError } from '@mds-core/mds-utils'
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

function api(app: express.Express): express.Express {
  app.get(
    pathsFor('/jurisdictions'),
    checkAccess(scopes => true),
    async (req: JurisdictionApiGetJurisdictionsRequest, res: JurisdictionApiGetJurisdictionsResponse) => {
      const { effective } = req.query
      const [error, jurisdictions] = await JurisdictionService.getAllJurisdictions({
        effective: effective ? Number(effective) : undefined
      })
      if (jurisdictions) {
        return res.status(200).send({
          version: JurisdictionApiCurrentVersion,
          jurisdictions
        })
      }
      return res.status(400).send({ error: error ?? new ServerError() })
    }
  )

  app.get(
    pathsFor('/jurisdictions/:jurisdiction_id'),
    checkAccess(scopes => true),
    async (req: JurisdictionApiGetJurisdictionRequest, res: JurisdictionApiGetJurisdictionResponse) => {
      const { effective } = req.query
      const { jurisdiction_id } = req.params
      const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(jurisdiction_id, {
        effective: effective ? Number(effective) : undefined
      })
      if (jurisdiction) {
        return res.status(200).send({
          version: JurisdictionApiCurrentVersion,
          jurisdiction
        })
      }
      return res.status(400).send({ error: error ?? new ServerError() })
    }
  )

  app.post(
    pathsFor('/jurisdictions'),
    checkAccess(scopes => true),
    async (req: JurisdictionApiCreateJurisdictionRequest, res: JurisdictionApiCreateJurisdictionResponse) => {
      if (Array.isArray(req.body)) {
        const [error, jurisdictions] = await JurisdictionService.createJurisdictions(req.body)
        if (jurisdictions) {
          return res.status(201).send({
            version: JurisdictionApiCurrentVersion,
            jurisdictions
          })
        }
        return res.status(400).send({ error: error ?? new ServerError() })
      }
      const [error, jurisdiction] = await JurisdictionService.createJurisdiction(req.body)
      if (jurisdiction) {
        return res.status(201).send({
          version: JurisdictionApiCurrentVersion,
          jurisdiction
        })
      }
      return res.status(400).send({ error: error ?? new ServerError() })
    }
  )

  return app
}

export { api }
