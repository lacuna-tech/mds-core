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
const request = supertest(ApiServer(api))
const [major, minor] = COLLECTOR_API_DEFAULT_VERSION.split('.')
const CollectorApiContentType = `${COLLECTOR_API_MIME_TYPE}; charset=utf-8; version=${major}.${minor}`

const Get = (path: string) => {
  const url = pathPrefix(path)
  return {
    Responds: (code: number, response: Partial<{ body: {}; headers: {} }> = {}) =>
      it(`GET ${url} (${code} ${HttpStatus.getStatusText(code).toUpperCase()})`, async () => {
        expect(await request.get(url).expect(code)).toMatchObject(response)
      })
  }
}

describe('Collector API', () => {
  describe('Service Unavailable', () => {
    Get('/schema/test').Responds(HttpStatus.INTERNAL_SERVER_ERROR, {
      headers: { 'content-type': CollectorApiContentType },
      body: { error: { isServiceError: true, type: 'ServiceUnavailable' } }
    })
  })

  describe('Unknown Route', () => {
    Get('/four-oh-four').Responds(HttpStatus.NOT_FOUND)
  })

  describe('API Endpoints', () => {
    beforeAll(async () => {
      await CollectorService.start()
    })

    Get('/health').Responds(HttpStatus.OK, {
      body: { name: process.env.npm_package_name, version: process.env.npm_package_version, status: 'Running' }
    })

    Get('/schema/test').Responds(HttpStatus.OK, {
      headers: { 'content-type': CollectorApiContentType },
      body: { $schema: 'http://json-schema.org/draft/2019-09/schema#' }
    })

    Get('/schema/notfound').Responds(HttpStatus.NOT_FOUND, {
      headers: { 'content-type': CollectorApiContentType },
      body: { error: { isServiceError: true, type: 'NotFoundError' } }
    })

    afterAll(async () => {
      await CollectorService.stop()
    })
  })
})
