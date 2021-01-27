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
import { api } from '../api'

const request = supertest(ApiServer(api))

const CollectorService = CollectorServiceManager.controller()

describe('Collector API', () => {
  beforeAll(async () => {
    await CollectorService.start()
  })

  describe('Get Schema', () => {
    it(`Expect 200 - OK`, async () => {
      const { body } = await request.get(pathPrefix('/schema/test')).expect(HttpStatus.OK)
      expect(body.$schema).toBe('http://json-schema.org/draft/2019-09/schema#')
    })

    it(`Expect 404 - NOT FOUND`, async () => {
      const { body } = await request.get(pathPrefix('/schema/notfound')).expect(HttpStatus.NOT_FOUND)
      expect(body.error.isServiceError).toBeTruthy()
      expect(body.error.type).toBe('NotFoundError')
    })
  })

  afterAll(async () => {
    await CollectorService.stop()
  })
})
