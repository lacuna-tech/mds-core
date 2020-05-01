/*
    Copyright 2019-2020 City of Los Angeles.

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

import logger from '@mds-core/mds-logger'
import { hours } from '@mds-core/mds-utils'
import { JurisdictionServiceProvider } from '../service/provider'

const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']

const {
  env: { npm_package_name, npm_package_version, npm_package_git_commit }
} = process

const keepalive = (message: string, interval: number) => {
  logger.info(message)
  return setInterval(() => {
    logger.info(message)
  }, interval)
}

const server = async () => {
  await JurisdictionServiceProvider.initialize()

  const timeout = keepalive(
    `Running ${npm_package_name} v${npm_package_version} (${
      npm_package_git_commit ?? 'local'
    }) listening for ${signals.join(', ')}`,
    hours(1)
  )

  signals.forEach(signal =>
    process.on(signal, async () => {
      clearInterval(timeout)
      logger.info(
        `Shutting down ${npm_package_name} v${npm_package_version} (${npm_package_git_commit ?? 'local'}) on ${signal}`
      )
      await JurisdictionServiceProvider.shutdown()
    })
  )
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
server()
