/**
 * Copyright 2019 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cache from '@mds-core/mds-agency-cache'
import { ApiServer, HttpServer } from '@mds-core/mds-api-server'
import logger from '@mds-core/mds-logger'
import stream from '@mds-core/mds-stream'
import { api } from './api'

Promise.all([cache.startup(), stream.initialize()])
  .then(() => {
    return HttpServer(ApiServer(api), { port: process.env.AGENCY_API_HTTP_PORT })
  })
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  .catch(err => {
    logger.error('mds-agency startup failure', err)
  })
