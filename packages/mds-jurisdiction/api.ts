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
import { pathsFor } from '@mds-core/mds-utils'
import { checkAccess } from '@mds-core/mds-api-server'
import { JurisdictionApiVersionMiddleware } from './middleware'
import {
  CreateJurisdictionHandler,
  DeleteJurisdictionHandler,
  GetAllJurisdictionsHandler,
  GetOneJurisdictionHandler,
  UpdateJurisdictionHandler
} from './handlers'

export const api = (app: express.Express): express.Express =>
  app
    .use(JurisdictionApiVersionMiddleware)
    .get(
      pathsFor('/jurisdictions'),
      checkAccess(scopes => scopes.includes('jurisdictions:read') || scopes.includes('jurisdictions:read:claim')),
      GetAllJurisdictionsHandler
    )
    .get(
      pathsFor('/jurisdictions/:jurisdiction_id'),
      checkAccess(scopes => scopes.includes('jurisdictions:read') || scopes.includes('jurisdictions:read:claim')),
      GetOneJurisdictionHandler
    )
    .post(
      pathsFor('/jurisdictions'),
      checkAccess(scopes => scopes.includes('jurisdictions:write')),
      CreateJurisdictionHandler
    )
    .put(
      pathsFor('/jurisdictions/:jurisdiction_id'),
      checkAccess(scopes => scopes.includes('jurisdictions:write')),
      UpdateJurisdictionHandler
    )
    .delete(
      pathsFor('/jurisdictions/:jurisdiction_id'),
      checkAccess(scopes => scopes.includes('jurisdictions:write')),
      DeleteJurisdictionHandler
    )
