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
