// Copyright 2021 City of Los Angeles
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { CollectorServiceClient } from '../client'
import { CollectorServiceManager } from '../service/manager'

const CollectorServer = CollectorServiceManager.controller()

describe('Collector Service', () => {
  it('Service Unavailable', async () => {
    await expect(CollectorServiceClient.getSchema('test')).rejects.toMatchObject({
      isServiceError: true,
      type: 'ServiceUnavailable'
    })
  })

  describe('Service Methods', () => {
    beforeAll(async () => {
      await CollectorServer.start()
    })

    it('Get Schema (Result)', async () => {
      const schema = await CollectorServiceClient.getSchema('test')
      expect(schema).toMatchObject({ $schema: 'http://json-schema.org/draft/2019-09/schema#' })
    })

    it('Get Schema (Error)', async () => {
      await expect(CollectorServiceClient.getSchema('notfound')).rejects.toMatchObject({
        isServiceError: true,
        type: 'NotFoundError'
      })
    })

    afterAll(async () => {
      await CollectorServer.stop()
    })
  })
})
