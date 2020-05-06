import express from 'express'
import decode from 'jwt-decode'
import { UUID } from '@mds-core/mds-types'

export interface AuthorizerClaims {
  principalId: string
  scope: string
  provider_id: UUID | null
  user_email: string | null
  jurisdictions: string | null
}

export type Authorizer = (authorization: string) => AuthorizerClaims | null
export type ApiAuthorizer = (req: express.Request) => AuthorizerClaims | null

export const CustomClaim = (claim: 'provider_id' | 'user_email' | 'jurisdictions') => {
  const { TOKEN_CUSTOM_CLAIM_NAMESPACE = 'https://openmobilityfoundation.org' } = process.env
  return `${TOKEN_CUSTOM_CLAIM_NAMESPACE}${TOKEN_CUSTOM_CLAIM_NAMESPACE.endsWith('/') ? '' : '/'}${claim}`
}

const decoders: { [scheme: string]: (token: string) => AuthorizerClaims } = {
  bearer: (token: string) => {
    const {
      sub: principalId,
      scope,
      [CustomClaim('provider_id')]: provider_id = null,
      [CustomClaim('user_email')]: user_email = null,
      [CustomClaim('jurisdictions')]: jurisdictions = null,
      ...claims
    } = decode(token)
    return {
      principalId,
      scope,
      provider_id,
      user_email,
      jurisdictions,
      ...claims
    }
  },
  basic: (token: string) => {
    const [principalId, scope] = Buffer.from(token, 'base64').toString().split('|')
    return { principalId, scope, provider_id: principalId, user_email: principalId, jurisdictions: principalId }
  }
}

const BaseAuthorizer: Authorizer = authorization => {
  const [scheme, token] = authorization.split(' ')
  const decoder = decoders[scheme.toLowerCase()]
  return decoder ? decoder(token) : null
}

export const AuthorizationHeaderApiAuthorizer: ApiAuthorizer = req => {
  return req.headers?.authorization ? BaseAuthorizer(req.headers.authorization) : null
}

export const WebSocketAuthorizer = BaseAuthorizer
