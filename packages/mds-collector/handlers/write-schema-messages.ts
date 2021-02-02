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

import type { NextFunction } from 'express'
import HttpStatus from 'http-status-codes'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { CollectorService, CollectorServiceClient } from '@mds-core/mds-collector-backend'
import { asArray } from '@mds-core/mds-utils'
import { SingleOrArray } from '@mds-core/mds-types'
import { CollectorApiResponse, CollectorApiRequest } from '../@types'

export type CollectorApiWriteSchemaMessagesRequest = CollectorApiRequest<SingleOrArray<{}>> &
  ApiRequestParams<'schema_id'>

export type CollectorApiWriteSchemaMessagesResponseBody = ReturnType<CollectorService['writeSchemaMessages']>

export type CollectorApiWriteSchemaMessagesResponse = CollectorApiResponse<CollectorApiWriteSchemaMessagesResponseBody>

export const WriteSchemaMessagesHandler = async (
  req: CollectorApiWriteSchemaMessagesRequest,
  res: CollectorApiWriteSchemaMessagesResponse,
  next: NextFunction
) => {
  try {
    const { schema_id } = req.params
    // eslint-reason checkAccess middleware has previously verified that local.claims.provider_id is a UUID
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const producer_id = res.locals.claims!.provider_id!
    const messages = await CollectorServiceClient.writeSchemaMessages(schema_id, producer_id, asArray(req.body))
    return res.status(HttpStatus.CREATED).send(messages)
  } catch (error) {
    next(error)
  }
}
