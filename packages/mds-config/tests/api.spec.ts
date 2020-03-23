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
import test from 'unit.js'
import { ApiServer } from '@mds-core/mds-api-server'
import { api } from '../api'

const request = supertest(ApiServer(api))

const { MDS_CONFIG_PATH } = process.env

describe('Testing API', () => {
  before(() => {
    process.env.MDS_CONFIG_PATH = './'
  })

  it(`Default Settings File (missing)`, (done) => {
    request
      .get(`/config/settings`)
      .expect(404)
      .end((err, result) => {
        test.value(result.body.name).is('NotFoundError')
        done(err)
      })
  })

  it(`Default Settings File (partial)`, (done) => {
    request
      .get(`/config/settings?partial=true`)
      .expect(200)
      .end((err, result) => {
        test.value(result.body.settings).is(null)
        done(err)
      })
  })

  it(`Single Settings File (missing)`, (done) => {
    request
      .get(`/config/settings?p=missing`)
      .expect(404)
      .end((err, result) => {
        test.value(result.body.name).is('NotFoundError')
        done(err)
      })
  })

  it(`Single Settings File (partial)`, (done) => {
    request
      .get(`/config/settings/missing?partial=true`)
      .expect(200)
      .end((err, result) => {
        test.value(result.body.missing).is(null)
        done(err)
      })
  })

  it(`Single Settings File`, (done) => {
    request
      .get(`/config/settings/package`)
      .expect(200)
      .end((err, result) => {
        test.value(result.body.name).is('@mds-core/mds-config')
        done(err)
      })
  })

  it(`Multiple Settings File (missing)`, (done) => {
    request
      .get(`/config/settings?p=package&p=missing`)
      .expect(404)
      .end((err, result) => {
        test.value(result.body.name).is('NotFoundError')
        done(err)
      })
  })

  it(`Multiple Settings File (partial)`, (done) => {
    request
      .get(`/config/settings?p=package&p=missing&partial=true`)
      .expect(200)
      .end((err, result) => {
        test.value(result.body.name).is('@mds-core/mds-config')
        test.value(result.body.missing).is(null)
        done(err)
      })
  })

  it(`Multiple Settings Files`, (done) => {
    request
      .get(`/config/settings?p=package&p=tsconfig.build`)
      .expect(200)
      .end((err, result) => {
        test.value(result.body.name).is('@mds-core/mds-config')
        done(err)
      })
  })

  after(() => {
    process.env.MDS_CONFIG_PATH = MDS_CONFIG_PATH
  })
})
