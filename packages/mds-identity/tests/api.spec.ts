/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable @typescript-eslint/no-floating-promises */
import supertest from 'supertest'
import test from 'unit.js'
import { ApiServer } from '@mds-core/mds-api-server'
import { api } from '../api'

const APP_JSON = 'application/json; charset=utf-8'
const request = supertest(ApiServer(api))

describe('Verify API', () => {
  it('About', done => {
    request
      .get('/identity')
      .expect(200)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })
  it('Get Health', done => {
    request
      .get('/identity/health')
      .expect(200)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })
})
