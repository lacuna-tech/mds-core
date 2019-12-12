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
import { pathsFor, NotFoundError } from '@mds-core/mds-utils'
import { client } from '@mds-core/mds-config-service'
import {
  ConfigApiGetSettingsRequest,
  ConfigApiResponse,
  ConfigApiGetMergedSettingsRequest,
  ConfigApiRequest
} from './types'

const getSettings = async (req: ConfigApiRequest, res: ConfigApiResponse) => {
  const { properties } = res.locals
  try {
    const settings = await client.getSettings(properties)
    return res.status(200).send(settings)
  } catch (error) {
    return res.status(error instanceof NotFoundError ? 404 : 500).send({ ...error, properties })
  }
}

function api(app: express.Express): express.Express {
  // Return multiple settings properties specified in the query string merged into a single object
  app.get(
    pathsFor('/settings'),
    async (req: ConfigApiGetMergedSettingsRequest, res: ConfigApiResponse, next: express.NextFunction) => {
      res.locals.properties = req.query.p ?? 'settings'
      return next()
    },
    getSettings
  )

  // Return a single settings property specified as a route parameter
  app.get(
    pathsFor('/settings/:property'),
    async (req: ConfigApiGetSettingsRequest, res: ConfigApiResponse, next: express.NextFunction) => {
      res.locals.properties = req.params.property
      return next()
    },
    getSettings
  )

  return app
}

export { api }
