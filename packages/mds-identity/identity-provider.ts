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
import axios from 'axios'
import { cleanEnv, url, num } from 'envalid'
import { AuthorizationError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import HttpStatus from 'http-status-codes'

// Validate and create typed environment variable
const env = cleanEnv(process.env, {
  OAuthAuthorizationURL: url(),
  OAuthTokenURL: url(),
  OAuthTokenTimeout: num()
})

type CodeAuthenticateOptions = {
  code: string
  grant_type: string
  client_id: string
  code_verifier: string
  redirect_uri: string
}

type CodeAuthenticateResults = {
  access_token: string
  id_token: string
  expires_in: number
  scope: string
}

interface IdentityProvider {
  CodeAuthenticate: (options: CodeAuthenticateOptions) => Promise<CodeAuthenticateResults>
}

const auth0IdentityProvider: IdentityProvider = {
  CodeAuthenticate: async ({ code, grant_type, client_id, code_verifier, redirect_uri }) => {
    try {
      // Let's try exchanging the code for a token
      const tokenResponse = await axios.post(
        env.OAuthTokenURL,
        {
          grant_type,
          client_id,
          redirect_uri,
          code_verifier,
          code
        },
        { timeout: env.OAuthTokenTimeout }
      )

      const {
        data: { access_token, id_token, expires_in, scope }
      } = tokenResponse

      return { access_token, id_token, expires_in, scope }
    } catch (err) {
      // The exchange was rejected. Let's log the details and let it bubble up.
      const {
        response: { status, statusText, data }
      } = err
      await logger.log(
        status === HttpStatus.FORBIDDEN ? 'INFO' : 'ERROR',
        `OAuthToken exchange failed with ${status} ${statusText} ${JSON.stringify(data)}`
      )
      throw new AuthorizationError()
    }
  }
}

export default auth0IdentityProvider
