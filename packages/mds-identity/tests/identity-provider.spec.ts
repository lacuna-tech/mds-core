import sinon from 'sinon'
import axios from 'axios'
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import should from 'should'
import IdentityProvider from '../identity-provider'

describe('Identity Provider', () => {
  afterEach(() => {
    sinon.restore()
  })

  const codeAuthenticateParameters = {
    code: 'aaa',
    client_id: 'bbb',
    code_verifier: 'ccc',
    grant_type: 'ddd',
    redirect_uri: 'eee'
  }

  it('Resolved when idp returns authorized and expected results', async () => {
    const mockTokenData = { access_token: '111', id_token: '222', expires_in: 333, scope: 'test scope' }
    sinon.stub(axios, 'post').resolves({ data: mockTokenData })

    await IdentityProvider.CodeAuthenticate(codeAuthenticateParameters).should.eventually.eql(mockTokenData)
  })

  it('Rejects when idp returns 403', async () => {
    sinon.stub(axios, 'post').rejects({ response: { status: 403, statusText: 'unauthorized', data: 'unauthorized' } })

    await IdentityProvider.CodeAuthenticate(codeAuthenticateParameters).should.be.rejected()
  })

  it('Rejects when idp returns 401', async () => {
    sinon.stub(axios, 'post').rejects({ response: { status: 401, statusText: 'forbidden', data: 'forbidden' } })

    await IdentityProvider.CodeAuthenticate(codeAuthenticateParameters).should.be.rejected()
  })

  it('Rejects when idp returns 500', async () => {
    sinon.stub(axios, 'post').rejects({ response: { status: 500, statusText: 'server error', data: 'server_error' } })

    await IdentityProvider.CodeAuthenticate(codeAuthenticateParameters).should.be.rejected()
  })

  it('Rejects when idp returns 200 but unexpected results', async () => {
    sinon.stub(axios, 'post').rejects({ response: { wtf: 123 } })

    await IdentityProvider.CodeAuthenticate(codeAuthenticateParameters).should.be.rejected()
  })
})
