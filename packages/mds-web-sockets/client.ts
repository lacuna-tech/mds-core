import WebSocket from 'ws'
import { VehicleEvent, Telemetry } from '@mds-core/mds-types'
import log from '@mds-core/mds-logger'
import { setWsHeartbeat, WebSocketBase } from 'ws-heartbeat/client'
import https from 'https'
import { ENTITY_TYPE } from './types'

function doRequest(options: https.RequestOptions) {
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    const req = https.request(options)

    req.on('response', res => {
      resolve(res)
    })

    req.on('error', err => {
      reject(err)
    })
  })
}

const { TOKEN, URL = 'ws://mds-web-sockets:4000' } = process.env

let connection: WebSocket

/* Authenticate */
async function sendAuth() {
  return connection.send(`AUTH%Bearer ${TOKEN}`)
}

async function getClient() {
  if (connection && connection.readyState === 1) {
    return connection
  }

  const options = {
    hostname: URL,
    method: 'GET'
  }

  const res = (await doRequest(options)) as { statusCode: number }
  if (res.statusCode !== 503) {
    connection = new WebSocket(URL)

    setWsHeartbeat(connection as WebSocketBase, 'PING')

    connection.onopen = async () => {
      await sendAuth()
    }

    connection.onerror = async err => {
      return log.error(err)
    }

    return connection
  }
  throw new Error('Could not connect to WebSocket server!')
}

/* Force test event to be send back to client */
async function sendPush(entity: ENTITY_TYPE, data: VehicleEvent | Telemetry) {
  try {
    const client = await getClient()
    return client.send(`PUSH%${entity}%${JSON.stringify(data)}`)
  } catch (err) {
    await log.warn(err)
  }
}

export function writeTelemetry(telemetries: Telemetry[]) {
  return telemetries.map(telemetry => sendPush('TELEMETRIES', telemetry))
}

export function writeEvent(event: VehicleEvent) {
  return sendPush('EVENTS', event)
}

export function shutdown() {
  if (connection) connection.close()
}
