/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable @typescript-eslint/no-floating-promises */
import supertest from 'supertest'
import test from 'unit.js'
import { ApiServer } from '@mds-core/mds-api-server'
import HttpStatus from 'http-status-codes'
import sinon from 'sinon'
import { AuthorizationError } from '@mds-core/mds-utils'
import IdentityProvider from '../identity-provider'
import { api } from '../api'

const APP_JSON = 'application/json; charset=utf-8'
const request = supertest(ApiServer(api))

describe('mds-identity request handlers', () => {
  it('About', done => {
    request
      .get('/identity')
      .expect(HttpStatus.OK)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })
  it('Get Health', done => {
    request
      .get('/identity/health')
      .expect(HttpStatus.OK)
      .end((err, result) => {
        test.value(result).hasHeader('content-type', APP_JSON)
        done(err)
      })
  })
  it('Test Error', done => {
    request
      .get('/identity/test/error')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .end(err => {
        done(err)
      })
  })

  describe('GET /authorize', () => {
    it('Missing all parameters (BAD_REQUEST)', done => {
      request
        .get('/identity/authorize')
        .expect(HttpStatus.BAD_REQUEST)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          test.object(result.body).hasProperty('errors')

          const {
            body: { errors }
          } = result
          test.object(errors).isArray()
          test.array(errors).hasLength(5)

          done(err)
        })
    })

    it('Missing required scopes (BAD_REQUEST)', done => {
      request
        .get('/identity/authorize')
        .query({
          client_id: 'aaa',
          audience: 'bbb',
          code_challenge: 'ccc',
          redirect_uri: 'https://www.ray.com/freeze',
          scope: 'blah'
        })
        .expect(HttpStatus.BAD_REQUEST)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          test.object(result.body).hasProperty('errors')
          const {
            body: { errors }
          } = result
          test.object(errors).isArray()
          test.array(errors).hasLength(1)
          test.object(errors[0]).hasProperty('scope')
          done(err)
        })
    })

    it('Success (MOVED_PERMANENTLY)', done => {
      request
        .get('/identity/authorize')
        .query({
          client_id: 'aaa',
          audience: 'bbb',
          code_challenge: 'ccc',
          redirect_uri: 'https://www.ray.com/freeze',
          scope: 'openid profile email extra'
        })
        .expect(HttpStatus.MOVED_PERMANENTLY)
        .end((err, result) => {
          test.value(result).hasHeader('location')

          const {
            header: { location }
          } = result
          test.value(location).contains('aaa')
          test.value(location).contains('bbb')
          test.value(location).contains('ccc')
          test.value(location).contains('openid%20profile%20email%20extra')
          done(err)
        })
    })
  })

  describe('GET /authorize/callback', () => {
    it('Missing all parameters (BAD_REQUEST)', done => {
      request
        .get('/identity/authorize/callback')
        .expect(HttpStatus.BAD_REQUEST)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          test.object(result.body).hasProperty('errors')

          const {
            body: { errors }
          } = result
          test.object(errors).isArray()
          test.array(errors).hasLength(2)

          done(err)
        })
    })

    it('Success (MOVED_PERMANENTLY)', done => {
      request
        .get('/identity/authorize/callback')
        .query({ code: '123', state: 'redirect_uri=http%3A%2F%2Fwww.ray.com%2Ffreeze' })
        .expect(HttpStatus.MOVED_PERMANENTLY)
        .end((err, result) => {
          test.value(result).hasHeader('location')
          const {
            header: { location }
          } = result
          test.value(location).startsWith('http://www.ray.com/freeze')
          test.value(location).contains('123')
          done(err)
        })
    })
  })

  describe('POST /oauth/token', () => {
    it('Missing all parameters (BAD_REQUEST)', done => {
      request
        .post('/identity/oauth/token')
        .expect(HttpStatus.BAD_REQUEST)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          test.object(result.body).hasProperty('errors')

          const {
            body: { errors }
          } = result
          test.object(errors).isArray()
          test.array(errors).hasLength(4)

          done(err)
        })
    })

    it('Invalid grant_type (BAD_REQUEST)', done => {
      request
        .post('/identity/oauth/token')
        .send({ code: 'aaa', client_id: 'bbb', code_verifier: 'ccc', grant_type: 'something_unsupported' })
        .expect(HttpStatus.BAD_REQUEST)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          test.object(result.body).hasProperty('errors')

          const {
            body: { errors }
          } = result
          test.object(errors).isArray()
          test.array(errors).hasLength(1)
          test.object(errors[0]).hasProperty('grant_type')

          done(err)
        })
    })

    it('IDP returns UNAUTHORIZED (UNAUTHORIZED)', done => {
      sinon.stub(IdentityProvider, 'CodeAuthenticate').throws(new AuthorizationError())

      request
        .post('/identity/oauth/token')
        .send({ code: 'aaa', client_id: 'bbb', code_verifier: 'ccc', grant_type: 'authorization_code' })
        .expect(HttpStatus.UNAUTHORIZED)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)
          sinon.restore()
          done(err)
        })
    })

    it('Success (OK)', done => {
      const mockAuthenticateResults = { access_token: '111', id_token: '222', expires_in: 333, scope: 'test scope' }
      sinon.stub(IdentityProvider, 'CodeAuthenticate').resolves(mockAuthenticateResults)

      request
        .post('/identity/oauth/token')
        .send({ code: 'aaa', client_id: 'bbb', code_verifier: 'ccc', grant_type: 'authorization_code' })
        .expect(HttpStatus.OK)
        .end((err, result) => {
          test.value(result).hasHeader('content-type', APP_JSON)

          const {
            body: { access_token, id_token, expires_in, scope, token_type }
          } = result
          test.value(access_token).hasValue(mockAuthenticateResults.access_token)
          test.value(id_token).hasValue(mockAuthenticateResults.id_token)
          test.number(expires_in).is(mockAuthenticateResults.expires_in)
          test.value(scope).hasValue(mockAuthenticateResults.scope)
          test.value(token_type).hasValue('Bearer')

          sinon.restore()
          done(err)
        })
    })
  })
})
