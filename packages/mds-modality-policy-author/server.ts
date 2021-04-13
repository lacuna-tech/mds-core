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

import { ApiServer, HttpServer } from '@mds-core/mds-api-server'
import { ModalityPolicyTypeInfo } from '@mds-core/mds-types'
import express from 'express'
import { injectModalityValidator, injectVersion } from '@mds-core/mds-policy-author-middleware'
import { api } from '@mds-core/mds-policy-author'

HttpServer(
  api<ModalityPolicyTypeInfo>(
    injectModalityValidator(
      injectVersion(
        ApiServer((app: express.Express) => {
          return app
        })
      )
    )
  ),
  { port: process.env.POLICY_AUTHOR_API_HTTP_PORT }
)
