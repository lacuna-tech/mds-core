import sinon from 'sinon'
import axios from 'axios'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import IdentityProvider from '../identity-provider'

const { expect } = chai
chai.use(chaiAsPromised)

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

    await expect(IdentityProvider.CodeAuthenticate(codeAuthenticateParameters)).to.eventually.eql(mockTokenData)
  })

  it('Rejects when idp returns 403', async () => {
    sinon.stub(axios, 'post').rejects({ response: { status: 403, statusText: 'unauthorized', data: 'unauthorized' } })

    await expect(IdentityProvider.CodeAuthenticate(codeAuthenticateParameters)).to.be.rejected
  })

  it('Rejects when idp returns 401', async () => {
    sinon.stub(axios, 'post').rejects({ response: { status: 401, statusText: 'forbidden', data: 'forbidden' } })

    await expect(IdentityProvider.CodeAuthenticate(codeAuthenticateParameters)).to.be.rejected
  })

  it('Rejects when idp returns 200 but unexpected results', async () => {
    sinon.stub(axios, 'post').rejects({ response: { wtf: 123 } })

    await expect(IdentityProvider.CodeAuthenticate(codeAuthenticateParameters)).to.be.rejected
  })
})
