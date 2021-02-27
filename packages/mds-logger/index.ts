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

import httpContext from 'express-http-context'

const logger: Pick<Console, 'info' | 'warn' | 'error'> = console
type LogLevel = keyof typeof logger

type LogArgs = [message: string, obj?: object]

const redact = (arg: unknown): object => {
  const res = JSON.stringify(arg instanceof Error ? arg.toString() : arg, (k, v) =>
    ['lat', 'lng'].includes(k) ? '[REDACTED]' : v
  )

  return JSON.parse(res)
}

const log = (level: LogLevel, ...[message, obj]: LogArgs): any => {
  if (process.env.QUIET === 'true') {
    return
  }

  const { message: log_message, ...log_data } = { message: redact(message), ...redact(obj) }
  const log_timestamp = Date.now()
  const log_ISO_timestamp = new Date(log_timestamp).toISOString()
  const log_requestId = httpContext.get('x-request-id')

  logger[level]({
    log_level: level.toUpperCase(),
    log_ISO_timestamp,
    log_timestamp,
    ...(log_requestId ? { log_requestId } : {}),
    log_data
  })

  return log_data
}

const info = (...args: LogArgs) => log('info', ...args)
const warn = (...args: LogArgs) => log('warn', ...args)
const error = (...args: LogArgs) => log('error', ...args)

export default { log, info, warn, error }
