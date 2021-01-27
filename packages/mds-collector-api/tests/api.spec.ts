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

import supertest from 'supertest'
import HttpStatus from 'http-status-codes'
import { CollectorServiceManager } from '@mds-core/mds-collector-service/service/manager'
import { ApiServer } from '@mds-core/mds-api-server'
import { pathPrefix } from '@mds-core/mds-utils'
import { COLLECTOR_API_DEFAULT_VERSION, COLLECTOR_API_MIME_TYPE } from '../@types'
import { api } from '../api'

const CollectorService = CollectorServiceManager.controller()

describe('Collector API', () => {
  const request = supertest(ApiServer(api))
  const [major, minor] = COLLECTOR_API_DEFAULT_VERSION.split('.')
  const ContentType = `${COLLECTOR_API_MIME_TYPE}; charset=utf-8; version=${major}.${minor}`

  it('RPC service unavailable', async () => {
    const { body, headers } = await request.get(pathPrefix('/schema/test')).expect(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(headers).toMatchObject({ 'content-type': ContentType })
    expect(body).toMatchObject({ error: { isServiceError: true, type: 'ServiceUnavailable' } })
  })

  describe('Endpoints', () => {
    beforeAll(async () => {
      await CollectorService.start()
    })

    describe('GET /health', () => {
      it(`OK`, async () => {
        const { body } = await request.get(pathPrefix('/health')).expect(HttpStatus.OK)
        expect(body).toMatchObject({
          name: process.env.npm_package_name,
          version: process.env.npm_package_version,
          status: 'Running'
        })
      })
    })

    describe('GET /schema', () => {
      it(`OK`, async () => {
        const { body, headers } = await request.get(pathPrefix('/schema/test')).expect(HttpStatus.OK)
        expect(headers).toMatchObject({ 'content-type': ContentType })
        expect(body).toMatchObject({ $schema: 'http://json-schema.org/draft/2019-09/schema#' })
      })

      it(`NOT FOUND`, async () => {
        const { body, headers } = await request.get(pathPrefix('/schema/notfound')).expect(HttpStatus.NOT_FOUND)
        expect(headers).toMatchObject({ 'content-type': ContentType })
        expect(body).toMatchObject({ error: { isServiceError: true, type: 'NotFoundError' } })
      })
    })

    afterAll(async () => {
      await CollectorService.stop()
    })
  })
})
