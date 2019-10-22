import {
  JUMP_PROVIDER_ID,
  LIME_PROVIDER_ID,
  BIRD_PROVIDER_ID,
  LYFT_PROVIDER_ID,
  WHEELS_PROVIDER_ID,
  SPIN_PROVIDER_ID,
  SHERPA_LA_PROVIDER_ID,
  BOLT_PROVIDER_ID
} from '@mds-core/mds-providers'

import requestPromise from 'request-promise'

// The list of providers ids on which to report
export const reportProviders = [
  JUMP_PROVIDER_ID,
  LIME_PROVIDER_ID,
  BIRD_PROVIDER_ID,
  LYFT_PROVIDER_ID,
  WHEELS_PROVIDER_ID,
  SPIN_PROVIDER_ID,
  SHERPA_LA_PROVIDER_ID,
  BOLT_PROVIDER_ID
]

export interface AuthToken {
  access_token: string
}

export async function getAuthToken() {
  const token_options = {
    url: `${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      audience: process.env.AUDIENCE
    },
    json: true
  }
  const token: AuthToken = await requestPromise.post(token_options)
  return token
}
