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

// Sorry about all the `any` type declarations, but log messages can be
// arbitrarily nested JS objects.

/* eslint no-console: "off" */

const { env } = process

type LogLevel = 'INFO' | 'WARN' | 'ERROR'

interface Datum {
  lat?: string
  lng?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any
}

function makeCensoredDatum(datum: Datum) {
  if (datum instanceof Error) {
    return datum.toString()
  }
  const censoredDatum: Datum = { ...datum }
  if (censoredDatum.lat != null) {
    censoredDatum.lat = 'CENSORED_LAT'
  }
  if (censoredDatum.lng != null) {
    censoredDatum.lng = 'CENSORED_LNG'
  }
  return censoredDatum
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAtomic(item: any) {
  const type = typeof item
  return ['string', 'number', 'boolean', 'undefined'].includes(type) || item == null
}

// just in case we have to censor something nested like
// { data: [{ lat:1, lng:2 }] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeCensoredLogMsgRecurse(msg: any): any {
  if (isAtomic(msg)) {
    return msg
  }
  if (Array.isArray(msg)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return msg.map((arr_item: any) => makeCensoredLogMsgRecurse(arr_item))
  }
  const censoredObject = makeCensoredDatum(msg)
  if (typeof censoredObject === 'object') {
    Object.keys(censoredObject).forEach((key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val: any = censoredObject[key]
      if (!isAtomic(val)) {
        censoredObject[key] = makeCensoredLogMsgRecurse(val)
      }
    })
  }
  return censoredObject
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeCensoredLogMsg(...msgs: any[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return makeCensoredLogMsgRecurse(msgs).map((item: any) =>
    // never print out '[object Object]'
    String(item) === '[object Object]' ? JSON.stringify(item) : item
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function info(...msg: any[]): any[] {
  if (env.QUIET) {
    return []
  }
  const censoredMsg = makeCensoredLogMsg(...msg)
  console.info('INFO', ...censoredMsg)
  return censoredMsg
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function warn(...msg: any[]): any[] {
  if (env.QUIET) {
    return []
  }
  const censoredMsg = makeCensoredLogMsg(...msg)
  console.warn('WARN', ...censoredMsg)
  return censoredMsg
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function error(...msg: any[]): any[] {
  if (env.QUIET) {
    return []
  }
  const censoredMsg = makeCensoredLogMsg(...msg)
  console.error('ERROR', ...censoredMsg)
  return censoredMsg
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(logLevel: LogLevel, ...msg: any[]): any[] {
  return {
    INFO: info,
    WARN: warn,
    ERROR: error
  }[logLevel](...msg)
}

export = { log, info, warn, error }
