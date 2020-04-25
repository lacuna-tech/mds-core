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

import {
  JurisdictionServiceClient,
  CreateJurisdictionType,
  JurisdictionDomainModel
} from '@mds-core/mds-jurisdiction-service'
import { HandleServiceResponse } from '@mds-core/mds-service-helpers'
import { JurisdictionApiRequest, JurisdictionApiResponse } from '../types'

interface CreateJurisdictionRequest extends JurisdictionApiRequest {
  body: CreateJurisdictionType | CreateJurisdictionType[]
}

type CreateJurisdictionResponse = JurisdictionApiResponse<
  | {
      jurisdiction: JurisdictionDomainModel
    }
  | {
      jurisdictions: JurisdictionDomainModel[]
    }
>

export const CreateJurisdictionHandler = async (req: CreateJurisdictionRequest, res: CreateJurisdictionResponse) => {
  HandleServiceResponse(
    await JurisdictionServiceClient.createJurisdictions(Array.isArray(req.body) ? req.body : [req.body]),
    error => {
      if (error.type === 'ValidationError') {
        return res.status(400).send({ error })
      }
      if (error.type === 'ConflictError') {
        return res.status(409).send({ error })
      }
      return res.status(500).send({ error })
    },
    jurisdictions => {
      const { version } = res.locals
      if (!Array.isArray(req.body)) {
        const [jurisdiction] = jurisdictions
        return res.status(201).send({ version, jurisdiction })
      }
      return res.status(201).send({ version, jurisdictions })
    }
  )
}
