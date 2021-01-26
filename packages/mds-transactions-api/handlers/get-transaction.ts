/**
 * Copyright 2020 City of Los Angeles
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

import { TransactionServiceClient, TransactionDomainModel } from '@mds-core/mds-transactions-service'
import { isError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { NotFoundError, ServerError } from '@mds-core/mds-utils'
import { TransactionApiResponse, TransactionApiRequest } from '../@types'

export type TransactionApiGetTransactionRequest = TransactionApiRequest & ApiRequestParams<'id'>

export type TransactionApiGetTransactionResponse = TransactionApiResponse<{ transaction: TransactionDomainModel }>

export const GetTransactionHandler = async (
  req: TransactionApiGetTransactionRequest,
  res: TransactionApiGetTransactionResponse
) => {
  try {
    const { id } = req.params
    const transaction = await TransactionServiceClient.getTransaction(id)
    const { version } = res.locals
    return res.status(200).send({ version, transaction })
  } catch (error) {
    if (isError(error, NotFoundError)) {
      return res.status(404).send({ error })
    }
    return res.status(500).send({ error: new ServerError(error) })
  }
}
