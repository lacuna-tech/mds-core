/* eslint-reason need to have multiline RSA key */
/* eslint-disable no-multi-str */
import WebSocket from 'ws'
import { MOCHA_PROVIDER_ID } from '@mds-core/mds-providers'
import { PROVIDER_SCOPES } from '@mds-core/mds-test-data'
import Sinon from 'sinon'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from '../server'
import { Clients } from '../clients'

const JWT_AUDIENCE = 'https://example.com'
const JWT_ISSUER = 'https://example.com'

process.env.JWT_AUDIENCE = JWT_AUDIENCE
process.env.TOKEN_ISSUER = JWT_ISSUER

const RSA_PRIVATE_KEY = 'foob'

const token = jwt.sign({ provider_id: MOCHA_PROVIDER_ID, scope: PROVIDER_SCOPES }, RSA_PRIVATE_KEY, {
  algorithm: 'RS256',
  audience: 'https://example.com',
  issuer: 'https://example.com'
})

const ADMIN_AUTH = `Bearer ${token}`
// FIXME: Websockest unable to accept basic auth, need to makae this a Bearer JWT
// const ADMIN_AUTH = `basic ${Buffer.from(`${MOCHA_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`

const RSA_PUBLIC_KEY = 'foob'

const returnRsaPublicKey = async () => RSA_PUBLIC_KEY

before(() => {
  Sinon.stub(Clients, 'getKey').returns(returnRsaPublicKey())
  WebSocketServer()
})

describe('Tests MDS-Web-Sockets', () => {
  describe('Tests Authentication', () => {
    it('Tests admin:all scoped tokens can authenticate successfully', done => {
      const client = new WebSocket('ws://localhost:4009')
      client.onopen = () => {
        client.send(`AUTH%${ADMIN_AUTH}`)
      }

      client.on('message', data => {
        if (data === 'Authentication success!') {
          client.close()
          return done()
        }
        client.close()
        return done(data)
      })
    })
  })
})
