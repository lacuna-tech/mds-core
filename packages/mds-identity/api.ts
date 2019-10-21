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
import { pathsFor, AuthorizationError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { ApiResponse, ApiRequest } from '@mds-core/mds-api-server'
import { cleanEnv, url } from 'envalid'
import {
  IdentityApiGetAuthorizeRequest,
  IdentityApiGetAuthorizeReponse,
  IdentityApiGetAuthorizeCallbackRequest,
  IdentityApiGetAuthorizeCallbackReponse,
  IdentityApiPostOauthTokenRequest,
  IdentityApiPostOauthTokenReponse
} from './types'
import axios from 'axios'
import { check, validationResult } from 'express-validator';
import HttpStatus from 'http-status-codes'

// Validate and create typed environment variable
const env = cleanEnv(process.env, {
  OAuthAuthorizationURL: url(),
  OAuthTokenURL: url()
})

const buildCallbackUri = (req: ApiRequest) => urls.format({
  protocol: req.get('x-forwarded-proto') || req.protocol,
  host: req.get('host'),
  pathname: `${req.path}/callback`
})

function api(app: express.Express): express.Express {

  // General purpose middleware
  app.use(async (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
    logger.info(req.method, req.originalUrl)
    return next()
  })

  // Http request parameter validation enforcement middleware
  const validate = (req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {

    const result = validationResult(req)

    if (result.isEmpty()) {
      // No validation errors, so let's keep going
      return next()
    }

    // There were some validation errors, so return a BadRequest with body indicating the errors
    return res.status(HttpStatus.BAD_REQUEST).json({
      errors: result.array().reduce<any>((errors, err) => { return [ ...errors, { [err.param]: err.msg } ] }, []),
    })
  }

  // GET /authorize
  app.get(pathsFor('/authorize'),
    check(['client_id', 'audience', 'code_challenge', 'redirect_uri']).exists().withMessage('required parameter'),
    check('scope').exists().withMessage('required parameter').bail().custom(value => {
      // Enforcing that a required set of scopes were specified by the client.
      const requiredScopes = ['openid', 'profile', 'email']
      const providedScopes = (value || '').split(' ')
      return requiredScopes.every(scope => providedScopes.includes(scope))
        ? true
        : Promise.reject(`Missing some or all required scopes ${JSON.stringify(requiredScopes)}`)
    }),
    validate,
    async (req: IdentityApiGetAuthorizeRequest, res: IdentityApiGetAuthorizeReponse) => {
      const { client_id, audience, code_challenge, scope, redirect_uri } = req.query

      // This is login ingress, so redirect to the IDP
      res.redirect(
        HttpStatus.PERMANENT_REDIRECT,
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
            redirect_uri: buildCallbackUri(req),
            state: qs.stringify({ redirect_uri })
          })
        })
      )
    }
  )

  // GET /authorize/callback
  app.get(
    pathsFor('/authorize/callback'),
    check(['state', 'code']).exists().withMessage('required parameter'),
    validate,
    async (req: IdentityApiGetAuthorizeCallbackRequest, res: IdentityApiGetAuthorizeCallbackReponse) => {
      const { state, code } = req.query
      const { redirect_uri } = qs.parse(state!)

      // This is login egress, so redirect back to client
      res.redirect(
        HttpStatus.PERMANENT_REDIRECT,
        urls.format({
          ...urls.parse(redirect_uri as string),
          search: qs.stringify({
            code
          })
        })
      )
    }
  )

  // POST /oauth/token
  app.post(
    pathsFor('/oauth/token'),
    check(['code', 'grant_type', 'client_id', 'code_verifier']).exists().withMessage('required parameter'),
    check('grant_type').exists().withMessage('required parameter').bail().equals('authorization_code').withMessage('Unsupported grant_type'),
    validate,
    async (req: IdentityApiPostOauthTokenRequest, res: IdentityApiPostOauthTokenReponse, next: express.NextFunction ) => {

      const { code, grant_type, client_id, code_verifier } = req.body

      try
      {
        // Let's try exchanging the code for a token
        const tokenResponse = await axios.post(env.OAuthTokenURL, {
          grant_type,
          client_id,
          redirect_uri: buildCallbackUri(req),
          code_verifier,
          code
        })

        /// Got an OK response so let's pull out relevant info and return an access & id tokens

        const { data: { access_token, id_token, expires_in, scope } } = tokenResponse;
        res.status(HttpStatus.OK).send({ access_token, id_token, expires_in, scope, token_type: 'Bearer' })
      }
      catch(err)
      {
        /// Got some sort of error response so let's handle certain 40x response codes as such and let everything else ride

        const { response: { status, statusText, data }  } = err
        const authorizationError = new AuthorizationError(`Authorization token exchange failed with ${status} ${statusText} ${JSON.stringify(data)}`);

        if (status === HttpStatus.FORBIDDEN || status === HttpStatus.UNAUTHORIZED)
        {
          await logger.info(req.method, req.originalUrl, authorizationError)
          res.status(status).send(data)
        }
        else
        {
          next(authorizationError)
        }
      }
    }
  )

  // Global error handling middleware
  app.use(async (err: Error, req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
    await logger.error(req.method, req.originalUrl, err)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err).send(env.isProduction ? {} : err.stack)
  });

  return app
}

export { api }
