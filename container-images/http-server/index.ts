import { env } from '@container-images/env-inject'
import express from 'express'

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
const {
  npm_package_name,
  npm_package_version,
  npm_package_git_commit,
  HTTP_KEEP_ALIVE_TIMEOUT = 15000,
  HTTP_HEADERS_TIMEOUT = 20000
} = env()

export const HttpServer = (port: number, api: express.Express) => {
  const server = api.listen(port, () =>
    /* eslint-reason avoids import of logger */
    /* eslint-disable-next-line no-console */
    console.log(`${npm_package_name} v${npm_package_version} (${npm_package_git_commit}) running on port ${port}`)
  )

  // Increase default timeout values to reduce spurious 503 errors from Istio
  server.keepAliveTimeout = Number(HTTP_KEEP_ALIVE_TIMEOUT)
  server.headersTimeout = Number(HTTP_HEADERS_TIMEOUT)

  return server
}
