/**
 * Copyright 2021 City of Los Angeles
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

import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { CollectorServiceClient } from '@mds-core/mds-collector-service'
import { CollectorApiResponse, CollectorApiRequest } from '../@types'

export type CollectorApiGetSchemaRequest = CollectorApiRequest & ApiRequestParams<'name'>

export type CollectorApiGetSchemaResponseBody = {}

export type CollectorApiGetSchemaResponse = CollectorApiResponse<CollectorApiGetSchemaResponseBody>

export const GetSchemaHandler = async (req: CollectorApiGetSchemaRequest, res: CollectorApiGetSchemaResponse) => {
  try {
    const { name } = req.params
    const schema = await CollectorServiceClient.getSchema(name)
    return res.status(200).send(schema)
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
