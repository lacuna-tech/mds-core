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

import {
  TransactionServiceClient,
  TransactionDomainModel,
  PaginationLinks,
  SORTABLE_COLUMNS,
  SORTABLE_COLUMN,
  SORT_DIRECTIONS,
  SORT_DIRECTION
} from '@mds-core/mds-transactions-service'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { parseRequest } from '@mds-core/mds-api-helpers'
import { ServerError, ValidationError } from '@mds-core/mds-utils'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiGetTransactionsRequest = TransactionApiRequest &
  ApiRequestParams<'provider_id' | 'start_timestamp' | 'end_timestamp'>

export type TransactionApiGetTransactionsResponse = TransactionApiResponse<{
  transactions: TransactionDomainModel[]
  links: PaginationLinks
}>

export const GetTransactionsHandler = async (
  req: TransactionApiGetTransactionsRequest,
  res: TransactionApiGetTransactionsResponse
) => {
  try {
    const { order_column: column } = parseRequest(req)
      .single({
        parser: x => {
          const isSortableColumn = (value: unknown): value is SORTABLE_COLUMN => SORTABLE_COLUMNS.includes(x as any)

          if (x) {
            if (typeof x === 'string') {
              if (isSortableColumn(x)) {
                return x
              }
            }

            /**
             * If the param exists but is not a string or sortable column, throw a validation error
             */
            throw new ValidationError(`Invalid sortable column ${x}`)
          }
        }
      })
      .query('order_column')

    const { order_direction: direction = 'ASC' } = parseRequest(req)
      .single({
        parser: x => {
          const isDirection = (value: unknown): value is SORT_DIRECTION => SORT_DIRECTIONS.includes(x as any)

          if (x) {
            if (typeof x === 'string') {
              if (isDirection(x)) {
                return x
              }
            }

            /**
             * If the param exists but is not a string or direction, throw a validation error
             */
            throw new ValidationError(`Invalid sort direction ${x}`)
          }
        }
      })
      .query('order_direction')

    const order = column ? { column, direction } : undefined

    const { transactions, cursor } = await TransactionServiceClient.getTransactions({
      ...parseRequest(req).single({ parser: String }).query('provider_id'),
      ...parseRequest(req).single({ parser: Number }).query('start_timestamp', 'end_timestamp'),
      order
    })
    const { version } = res.locals
    // convert Cursor to links
    // TODO finish implementing
    const links: PaginationLinks = {
      first: 'first?',
      last: 'last?',
      prev: cursor.beforeCursor,
      next: cursor.afterCursor
    }
    console.log('!!!!', JSON.stringify(links))
    return res.status(200).send({ version, transactions, links })
  } catch (error) {
    return res.status(500).send({ error: new ServerError(error) })
  }
}
