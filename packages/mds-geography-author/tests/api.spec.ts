/* eslint-disable @typescript-eslint/no-floating-promises */
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

// eslint directives:
/* eslint-disable no-plusplus */
/* eslint-disable no-useless-concat */
/* eslint-disable prefer-destructuring */
/* eslint-disable promise/prefer-await-to-callbacks */

/* eslint-reason extends object.prototype */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import assert from 'assert'
import sinon from 'sinon'
import supertest from 'supertest'
import test from 'unit.js'
import db from '@mds-core/mds-db'
import uuid from 'uuid'
import { Geography } from '@mds-core/mds-types'
import { ApiServer } from '@mds-core/mds-api-server'
import {
  POLICY_UUID,
  GEOGRAPHY_UUID,
  GEOGRAPHY2_UUID,
  LA_CITY_BOUNDARY,
  DISTRICT_SEVEN,
  SCOPED_AUTH
} from '@mds-core/mds-test-data'
import { api } from '../api'

/* eslint-disable-next-line no-console */
const log = console.log.bind(console)

const request = supertest(ApiServer(api))

const APP_JSON = 'application/json; charset=utf-8'
const EMPTY_SCOPE = SCOPED_AUTH([], '')
const EVENTS_READ_SCOPE = SCOPED_AUTH(['events:read'])
const POLICIES_WRITE_SCOPE = SCOPED_AUTH(['policies:write'])
const POLICIES_READ_SCOPE = SCOPED_AUTH(['policies:read'])
const POLICIES_DELETE_SCOPE = SCOPED_AUTH(['policies:delete'])
const sandbox = sinon.createSandbox()

describe('Tests app', () => {
  describe('Geography endpoint tests', () => {
    afterEach(() => {
      sandbox.restore()
    })

    before(async () => {
      await db.initialize()
    })

    after(async () => {
      await db.shutdown()
    })

    it('cannot POST one current geography (no auth)', done => {
      const geography = { geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
      request
        .post(`/geographies`)
        .set('Authorization', EMPTY_SCOPE)
        .send(geography)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('cannot POST one current geography (wrong auth)', done => {
      const geography = { geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
      request
        .post(`/geographies`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .send(geography)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('creates one current geography', done => {
      const geography = { name: 'LA', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
      request
        .post(`/geographies`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send(geography)
        .expect(201)
        .end((err, result) => {
          const body = result.body
          log('create one geo response:', body)
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('cannot GETs one current geography (no auth)', done => {
      request
        .get(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', EMPTY_SCOPE)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('cannot GETs one current geography (wrong auth)', done => {
      request
        .get(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('GETs one current geography', done => {
      request
        .get(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
        .end((err, result) => {
          test.assert(result.body.geography_id === GEOGRAPHY_UUID)
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('cannot GET a nonexistent geography', done => {
      request
        .get(`/geographies/${POLICY_UUID}`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(404)
        .end(err => {
          done(err)
        })
    })

    it('cannot update one geography (no auth)', done => {
      const geography = { geography_id: GEOGRAPHY_UUID, geography_json: DISTRICT_SEVEN }
      request
        .put(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', EMPTY_SCOPE)
        .send(geography)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('cannot update one geography (wrong auth)', done => {
      const geography = { geography_id: GEOGRAPHY_UUID, geography_json: DISTRICT_SEVEN }
      request
        .put(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .send(geography)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('verifies updating one geography', done => {
      const geography = { name: 'LA', geography_id: GEOGRAPHY_UUID, geography_json: DISTRICT_SEVEN }
      request
        .put(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send(geography)
        .expect(201)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('cannot PUT geography metadata to create (no auth)', async () => {
      const metadata = { some_arbitrary_thing: 'boop' }
      await request
        .put(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', EMPTY_SCOPE)
        .send({ geography_id: GEOGRAPHY_UUID, geography_metadata: metadata })
        .expect(403)
    })

    it('cannot PUT geography metadata to create (wrong auth)', async () => {
      const metadata = { some_arbitrary_thing: 'boop' }
      await request
        .put(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .send({ geography_id: GEOGRAPHY_UUID, geography_metadata: metadata })
        .expect(403)
    })

    it('sends the correct error code if it cannot retrieve the metadata', async () => {
      sandbox.stub(db, 'readBulkGeographyMetadata').callsFake(function stubAThrow() {
        throw new Error('err')
      })
      await request
        .get(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(404)
    })

    it('verifies PUTing geography metadata to create', async () => {
      const metadata = { some_arbitrary_thing: 'boop' }
      await request
        .put(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send({ geography_id: GEOGRAPHY_UUID, geography_metadata: metadata })
        .expect(201)
      const result = await db.readSingleGeographyMetadata(GEOGRAPHY_UUID)
      test.assert(result.geography_metadata.some_arbitrary_thing === 'boop')
    })

    it('verifies PUTing geography metadata to edit', async () => {
      const metadata = { some_arbitrary_thing: 'beep' }
      await request
        .put(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send({ geography_id: GEOGRAPHY_UUID, geography_metadata: metadata })
        .expect(200)
      const result = await db.readSingleGeographyMetadata(GEOGRAPHY_UUID)
      test.assert(result.geography_metadata.some_arbitrary_thing === 'beep')
    })

    it('verifies that metadata cannot be created without a preexisting geography', async () => {
      const metadata = { some_arbitrary_thing: 'beep' }
      const nonexistentGeoUUID = uuid()
      await request
        .put(`/geographies/${nonexistentGeoUUID}/meta`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send({ geography_id: nonexistentGeoUUID, geography_metadata: metadata })
        .expect(404)
    })

    it('cannot GET geographies (no auth)', done => {
      request
        .get(`/geographies/`)
        .set('Authorization', EMPTY_SCOPE)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('cannot GET geographies (wrong auth)', done => {
      request
        .get(`/geographies/`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('can GET geographies, full version', done => {
      request
        .get(`/geographies/`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
        .end((err, result) => {
          result.body.forEach((item: Geography) => {
            test.assert(item.geography_json)
          })
          done(err)
        })
    })

    it('can GET geographies, summarized version', done => {
      request
        .get(`/geographies?summary=true`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
        .end((err, result) => {
          result.body.forEach((item: Geography) => {
            test.assert(!item.geography_json)
          })
          done(err)
        })
    })

    it('cannot GET geography metadata (no auth)', done => {
      request
        .get(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', EMPTY_SCOPE)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('cannot GET geography metadata (wrong auth)', done => {
      request
        .get(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('verifies GETing geography metadata', done => {
      request
        .get(`/geographies/${GEOGRAPHY_UUID}/meta`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
        .end((err, result) => {
          test.assert(result.body.geography_metadata.some_arbitrary_thing === 'beep')
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('verifies cannot GET non-existent geography metadata', done => {
      request
        .get(`/geographies/${uuid()}/meta`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(404)
        .end((err, result) => {
          test.assert(result.body.result === 'not found')
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('cannot PUT geography (no auth)', done => {
      const geography = { geography_id: GEOGRAPHY_UUID, geography_json: 'garbage_json' }
      request
        .put(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', EMPTY_SCOPE)
        .send(geography)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('cannot PUT geography (wrong auth)', done => {
      const geography = { geography_id: GEOGRAPHY_UUID, geography_json: 'garbage_json' }
      request
        .put(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .send(geography)
        .expect(403)
        .end(err => {
          done(err)
        })
    })

    it('verifies cannot PUT bad geography', done => {
      const geography = { name: 'LA', geography_id: GEOGRAPHY_UUID, geography_json: 'garbage_json' }
      request
        .put(`/geographies/${GEOGRAPHY_UUID}`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send(geography)
        .expect(400)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('verifies cannot PUT non-existent geography', done => {
      const geography = { name: 'LA', geography_id: POLICY_UUID, geography_json: DISTRICT_SEVEN }
      request
        .put(`/geographies/${POLICY_UUID}`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send(geography)
        .expect(404)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('verifies cannot POST invalid geography', done => {
      const geography = { name: 'LA', geography_id: GEOGRAPHY_UUID, geography_json: 'garbage_json' }
      request
        .post(`/geographies`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send(geography)
        .expect(400)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('cannot POST duplicate geography', done => {
      const geography = { name: 'LA', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY }
      request
        .post(`/geographies`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .send(geography)
        .expect(409)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          done(err)
        })
    })

    it('cannot do bulk geography metadata reads (no auth)', async () => {
      await request
        .get(`/geographies/meta?get_read_only=false`)
        .set('Authorization', EMPTY_SCOPE)
        .expect(403)
    })

    it('cannot do bulk geography metadata reads (wrong auth)', async () => {
      await request
        .get(`/geographies/meta?get_read_only=false`)
        .set('Authorization', EVENTS_READ_SCOPE)
        .expect(403)
    })

    it('correctly retrieves all geography metadata', async () => {
      await db.writeGeography({ name: 'Geography 2', geography_id: GEOGRAPHY2_UUID, geography_json: DISTRICT_SEVEN })
      await db.writeGeographyMetadata({ geography_id: GEOGRAPHY2_UUID, geography_metadata: { earth: 'isround' } })

      const result = await request
        .get(`/geographies/meta?get_read_only=false`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
      test.assert(result.body.length === 2)
      test.value(result).hasHeader('content-type', APP_JSON)
    })

    it('can publish a geography (correct auth)', async () => {
      const beforeResult = await request
        .get(`/geographies/${GEOGRAPHY2_UUID}`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
      test.assert(beforeResult.body.publish_date === null)
      const result = await request
        .put(`/geographies/${GEOGRAPHY2_UUID}/publish`)
        .set('Authorization', POLICIES_WRITE_SCOPE)
        .expect(200)
      test.value(result).hasHeader('content-type', APP_JSON)
      test.assert(result.body.geography_id === GEOGRAPHY2_UUID)
      test.assert(result.body.publish_date)
    })

    it('correctly retrieves only the metadata associated with published geographies', async () => {
      const result = await request
        .get(`/geographies/meta?get_read_only=true`)
        .set('Authorization', POLICIES_READ_SCOPE)
        .expect(200)
      test.assert(result.body.length === 1)
      test.value(result).hasHeader('content-type', APP_JSON)
    })

    it('cannot publish a geography (wrong auth)', async () => {
      await request
        .put(`/geographies/${GEOGRAPHY2_UUID}/publish`)
        .set('Authorization', EMPTY_SCOPE)
        .expect(403)
    })

    it('cannot delete a geography (incorrect auth)', async () => {
      await request
        .delete(`/geographies/${GEOGRAPHY2_UUID}`)
        .set('Authorization', EMPTY_SCOPE)
        .expect(403)
    })

    it('can delete a geography (correct auth)', async () => {
      const testUUID = uuid()
      await db.writeGeography({ geography_id: testUUID, geography_json: LA_CITY_BOUNDARY, name: 'testafoo' })
      await db.writeGeographyMetadata({ geography_id: testUUID, geography_metadata: { foo: 'afoo' } })
      await request
        .delete(`/geographies/${testUUID}`)
        .set('Authorization', POLICIES_DELETE_SCOPE)
        .expect(200)
      await assert.rejects(
        async () => {
          await db.readSingleGeography(testUUID)
        },
        { name: 'NotFoundError' }
      )
      await assert.rejects(
        async () => {
          await db.readSingleGeographyMetadata(testUUID)
        },
        { name: 'NotFoundError' }
      )
    })

    it('cannot delete a published geography (correct auth)', async () => {
      await request
        .delete(`/geographies/${GEOGRAPHY2_UUID}`)
        .set('Authorization', POLICIES_DELETE_SCOPE)
        .expect(405)
    })

    it('sends the correct error code if something blows up on the backend during delete', async () => {
      sandbox.stub(db, 'deleteGeography').callsFake(function stubAThrow() {
        throw new Error('random backend err')
      })
      await request
        .delete(`/geographies/${uuid()}`)
        .set('Authorization', POLICIES_DELETE_SCOPE)
        .expect(500)
    })
  })
})
