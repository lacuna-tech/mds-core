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
import { CollectorServiceClient } from '@mds-core/mds-collector-service'
import { asArray } from '@mds-core/mds-utils'
import { CollectorApiResponse, CollectorApiRequest } from '../@types'

export type CollectorApiWriteMessagesRequest = CollectorApiRequest<Array<{}>> & ApiRequestParams<'name'>

export type CollectorApiWriteMessagesResponseBody = {}

export type CollectorApiWriteMessagesResponse = CollectorApiResponse<CollectorApiWriteMessagesResponseBody>

export const WriteMessagesHandler = async (
  req: CollectorApiWriteMessagesRequest,
  res: CollectorApiWriteMessagesResponse,
  next: NextFunction
) => {
  try {
    const { name } = req.params
    const schema = await CollectorServiceClient.writeMessages(name, asArray(req.body ?? []))
    return res.status(HttpStatus.CREATED).send(schema)
  } catch (error) {
    next(error)
  }
}
