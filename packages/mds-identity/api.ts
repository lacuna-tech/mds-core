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

import express from 'express'
import urls from 'url'
import qs from 'querystring'
import { pathsFor, ServerError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { ApiResponse, ApiRequest } from '@mds-core/mds-api-server'
import { cleanEnv, url } from 'envalid'
import { IdentityApiGetAuthorizeRequest, IdentityApiGetAuthorizeReponse } from './types'

const env = cleanEnv(process.env, {
  OAuthAuthorizationURL: url(),
  OAuthTokenURL: url()
})

/* istanbul ignore next */
const InternalServerError = async <T>(req: ApiRequest, res: ApiResponse<T>, err?: string | Error) => {
  // 500 Internal Server Error
  await logger.error(req.method, req.originalUrl, err)
  return res.status(500).send({ error: new ServerError(err) })
}

function api(app: express.Express): express.Express {
  // ///////////////////// begin middleware ///////////////////////
  app.use(async (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
    logger.info(req.method, req.originalUrl)
    return next()
  })
  // ///////////////////// begin middleware ///////////////////////

  app.get(pathsFor('/authorize'), async (req: IdentityApiGetAuthorizeRequest, res: IdentityApiGetAuthorizeReponse) => {
    const { client_id, audience, code_challenge, scope, redirect_uri } = req.query

    res.redirect(
      302,
      urls.format({
        ...urls.parse(env.OAuthAuthorizationURL),
        search: qs.stringify({
          client_id,
          audience,
          code_challenge,
          code_challenge_method: 'S256',
          scope,
          protocol: 'oauth2',
          response_type: 'code',
          redirect_uri: urls.format({
            protocol: req.get('x-forwarded-proto') || req.protocol,
            host: req.get('host'),
            pathname: `${req.path}/callback`
          }),
          state: qs.stringify({ redirect_uri })
        })
      })
    )
  })

  return app
}

export { api }
