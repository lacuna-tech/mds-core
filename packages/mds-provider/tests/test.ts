/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/always-return */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/prefer-await-to-callbacks */
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

import supertest from 'supertest'
import { SCOPED_AUTH } from '@mds-core/mds-test-data'
import test from 'unit.js'
import { ApiServer } from '@mds-core/mds-api-server'
import { api } from '../api'

const APP_JSON = 'application/json; charset=utf-8'
const EMPTY_SCOPE = SCOPED_AUTH([], '')
const TRIPS_READ_SCOPE = SCOPED_AUTH(['trips:read'])
const STATUS_CHANGES_READ_SCOPE = SCOPED_AUTH(['status_changes:read'])

const request = supertest(ApiServer(api))

describe('Tests app', () => {
  it('Get Trips (no authorization)', done => {
    request
      .get('/trips')
      .expect(401)
      .end((err, result) => {
        test.value(result.text).is('Unauthorized')
        done(err)
      })
  })

  it('Get Trips (no scope)', done => {
    request
      .get('/trips')
      .set('Authorization', EMPTY_SCOPE)
      .expect(403)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })

  it('Get Trips (all)', done => {
    request
      .get('/trips')
      .set('Authorization', TRIPS_READ_SCOPE)
      .expect(501)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })

  it('Get Status Changes (no authorization)', done => {
    request
      .get('/status_changes')
      .expect(401)
      .end((err, result) => {
        test.value(result.text).is('Unauthorized')
        done(err)
      })
  })

  it('Get Status Changes (no scope)', done => {
    request
      .get('/status_changes')
      .set('Authorization', EMPTY_SCOPE)
      .expect(403)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })

  it('Get Status Changes (all)', done => {
    request
      .get('/status_changes')
      .set('Authorization', STATUS_CHANGES_READ_SCOPE)
      .expect(501)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })
})
