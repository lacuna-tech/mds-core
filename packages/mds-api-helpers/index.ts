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

import urls from 'url'
import express from 'express'
import { Query } from 'express-serve-static-core'

interface PagingParams {
  skip: number
  take: number
}

export const asPagingParams: <T extends Partial<{ [P in keyof PagingParams]: unknown }>>(
  params: T
) => T & PagingParams = params => {
  const [DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE] = [100, 1000]
  const [skip, take] = [params.skip, params.take].map(Number)
  return {
    ...params,
    skip: Number.isNaN(skip) || skip <= 0 ? 0 : skip,
    take: Number.isNaN(take) || take <= 0 ? DEFAULT_PAGE_SIZE : Math.min(take, MAX_PAGE_SIZE)
  }
}

const jsonApiLink = (req: express.Request, skip: number, take: number): string =>
  urls.format({
    protocol: req.get('x-forwarded-proto') || req.protocol,
    host: req.get('host'),
    pathname: req.path,
    query: { ...req.query, skip, take }
  })

export type JsonApiLinks = Partial<{ first: string; prev: string; next: string; last: string }> | undefined

export const asJsonApiLinks = (req: express.Request, skip: number, take: number, count: number): JsonApiLinks => {
  if (skip > 0 || take < count) {
    const first = skip > 0 ? jsonApiLink(req, 0, take) : undefined
    const prev = skip - take >= 0 && skip - take < count ? jsonApiLink(req, skip - take, take) : undefined
    const next = skip + take < count ? jsonApiLink(req, skip + take, take) : undefined
    const last = skip + take < count ? jsonApiLink(req, count - (count % take || take), take) : undefined
    return { first, prev, next, last }
  }
  return undefined
}

/* eslint-disable no-nested-ternary */
export const parseQuery = <T = string>(parser?: (val: string) => T) => <TKey extends string>(
  query: Query,
  ...keys: string[]
) => {
  return keys.reduce((acc: Partial<{ [P in TKey]: T }>, key) => {
    const val = query[key]
    return {
      ...acc,
      [key]: typeof val === 'string' ? (parser ? parser(val) : val) : val
    }
  }, {})
}
/* eslint-enable no-nested-ternary */
