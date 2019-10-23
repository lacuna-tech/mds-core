/* eslint-disable promise/prefer-await-to-callbacks */
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
import { pathsFor, AuthorizationError, ValidationError, ServerError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { ApiResponse, ApiRequest } from '@mds-core/mds-api-server'
import { cleanEnv, url } from 'envalid'
import { check, validationResult } from 'express-validator'
import HttpStatus from 'http-status-codes'
import {
  IdentityApiGetAuthorizeRequest,
  IdentityApiGetAuthorizeReponse,
  IdentityApiGetAuthorizeCallbackRequest,
  IdentityApiGetAuthorizeCallbackReponse,
  IdentityApiPostOauthTokenRequest,
  IdentityApiPostOauthTokenReponse
} from './types'
import IdentityProvider from './identity-provider'

// Validate and create typed environment variable
const env = cleanEnv(process.env, {
  OAuthAuthorizationURL: url(),
  OAuthTokenURL: url()
})

const buildCallbackUri = (req: ApiRequest) =>
  urls.format({
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
    return result.isEmpty()
      ? // No validation errors, so let's keep going
        next()
      : // There were some validation errors, so return a BadRequest with body indicating the errors
        res.status(HttpStatus.BAD_REQUEST).json({
          errors: result.array().reduce(
            (errors, err) => {
              return [...errors, { [err.param]: err.msg }]
            },
            [] as { [key: string]: {} }[]
          )
        })
  }

  // GET /authorize
  app.get(
    pathsFor('/authorize'),
    check(['client_id', 'audience', 'code_challenge', 'redirect_uri'])
      .exists()
      .withMessage('required parameter'),
    check('scope')
      .exists()
      .withMessage('required parameter')
      .bail()
      .custom(value => {
        // Enforcing that a required/minimum set of scopes were specified by the client.
        const requiredScopes = ['openid', 'profile', 'email']
        const providedScopes = (value || '').split(' ')
        return requiredScopes.every(scope => providedScopes.includes(scope))
          ? true
          : Promise.reject(new ValidationError(`Missing some or all required scopes ${JSON.stringify(requiredScopes)}`))
      }),
    validate,
    async (req: IdentityApiGetAuthorizeRequest, res: IdentityApiGetAuthorizeReponse, next: express.NextFunction) => {
      try {
        const { client_id, audience, code_challenge, scope, redirect_uri } = req.query

        // This is login ingress, so redirect to the IDP
        res.redirect(
          HttpStatus.MOVED_PERMANENTLY,
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
      } catch (err) {
        next(err)
      }
    }
  )

  // GET /authorize/callback
  app.get(
    pathsFor('/authorize/callback'),
    check(['state', 'code'])
      .exists()
      .withMessage('required parameter'),
    validate,
    async (
      req: IdentityApiGetAuthorizeCallbackRequest,
      res: IdentityApiGetAuthorizeCallbackReponse,
      next: express.NextFunction
    ) => {
      try {
        const { state, code } = req.query
        const { redirect_uri } = qs.parse(state)

        // This is login egress, so redirect back to client
        res.redirect(
          HttpStatus.MOVED_PERMANENTLY,
          urls.format({
            ...urls.parse(redirect_uri as string),
            search: qs.stringify({
              code
            })
          })
        )
      } catch (err) {
        next(err)
      }
    }
  )

  // POST /oauth/token
  app.post(
    pathsFor('/oauth/token'),
    check(['code', 'client_id', 'code_verifier'])
      .exists()
      .withMessage('required parameter'),
    check('grant_type')
      .exists()
      .withMessage('required parameter')
      .bail()
      .equals('authorization_code')
      .withMessage('Unsupported grant_type'),
    validate,
    async (req: IdentityApiPostOauthTokenRequest, res: IdentityApiPostOauthTokenReponse) => {
      try {
        const { code, grant_type, client_id, code_verifier } = req.body
        const { access_token, id_token, expires_in, scope } = await IdentityProvider.CodeAuthenticate({
          grant_type,
          client_id,
          redirect_uri: buildCallbackUri(req),
          code_verifier,
          code
        })

        res.status(HttpStatus.OK).send({ access_token, id_token, expires_in, scope, token_type: 'Bearer' })
      } catch (err) {
        await logger.info(req.method, req.originalUrl, err)
        // Regardless of the error diposition let's respond with a vanilla UNAUTHORIZED for phishing and privacy purposes.
        res.status(HttpStatus.UNAUTHORIZED).send(new AuthorizationError())
      }
    }
  )

  // GET /test/error
  app.get(
    pathsFor('/test/error'),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (
      req: IdentityApiPostOauthTokenRequest,
      res: IdentityApiPostOauthTokenReponse,
      next: express.NextFunction
    ) => {
      try {
        throw new ServerError('test error')
      } catch (err) {
        next(err)
      }
    }
  )

  // Global error handling middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(async (err: Error, req: ApiRequest, res: ApiResponse, next: express.NextFunction) => {
    await logger.error(req.method, req.originalUrl, err)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err)
  })

  return app
}

export { api }
