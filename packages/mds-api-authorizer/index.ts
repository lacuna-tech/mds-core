import express from 'express'
import decode from 'jwt-decode'
import { UUID } from '@mds-core/mds-types'

export interface ApiAuthorizerClaims {
  principalId: string
  scope: string
  provider_id: UUID | null
  user_email: string | null
}

const {
  TOKEN_PROVIDER_ID_CLAIM = 'https://ladot.io/provider_id',
  TOKEN_USER_EMAIL_CLAIM = 'https://ladot.io/user_email'
} = process.env

export type ApiAuthorizer = (req: express.Request) => ApiAuthorizerClaims | null
export type WsAuthorizer = (req: string) => ApiAuthorizerClaims | null

const decoders: { [scheme: string]: (token: string) => ApiAuthorizerClaims } = {
  bearer: (token: string) => {
    const {
      sub: principalId,
      scope,
      [TOKEN_PROVIDER_ID_CLAIM]: provider_id = null,
      [TOKEN_USER_EMAIL_CLAIM]: user_email = null,
      ...claims
    } = decode(token)
    return { principalId, scope, provider_id, user_email, ...claims }
  },
  basic: (token: string) => {
    const [principalId, scope] = Buffer.from(token, 'base64')
      .toString()
      .split('|')
    return { principalId, scope, provider_id: principalId, user_email: null }
  }
}

export const AuthorizationHeaderApiAuthorizer: ApiAuthorizer = req => {
  if (req.headers && req.headers.authorization) {
    const [scheme, token] = req.headers.authorization.split(' ')
    const decoder = decoders[scheme.toLowerCase()]
    return decoder ? decoder(token) : null
  }
  return null
}

export const WebSocketAuthorizer: WsAuthorizer = authorization => {
  const [scheme, token] = authorization.split(' ')
  const decoder = decoders[scheme.toLowerCase()]
  return decoder ? decoder(token) : null
}
