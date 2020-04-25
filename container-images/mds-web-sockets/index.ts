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

import { WebSocketServer } from '@mds-core/mds-web-sockets'
import logger from '@mds-core/mds-logger'

const { npm_package_name, npm_package_version, npm_package_git_commit, NATS_HOST } = process.env

WebSocketServer()
  .then(() => {
    logger.info(
      `Running ${npm_package_name} v${npm_package_version} (${
        npm_package_git_commit ?? 'local'
      }) connected to NATS on ${NATS_HOST}`
    )
    return 0
  })
  .catch(error => {
    logger.error(
      `${npm_package_name} v${npm_package_version} (${npm_package_git_commit}) connection to NATS on ${NATS_HOST} failed`,
      error
    )
    return 1
  })
