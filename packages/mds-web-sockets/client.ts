import WebSocket from 'ws'
import { VehicleEvent, Telemetry } from '@mds-core/mds-types'
import log from '@mds-core/mds-logger'
import { setWsHeartbeat, WebSocketBase } from 'ws-heartbeat/client'

const url = 'ws://localhost:4001'

const { env } = process

const { TOKEN } = env

let connection: WebSocket = new WebSocket(url)

function getClient() {
  if (connection && connection.readyState === 1) {
    return connection
  }
  connection = new WebSocket(url)

  do {
    log.info('Establishing connection...')
  } while (connection.readyState !== 1)

  return connection
}

/* Authenticate */
async function sendAuth() {
  return connection.send(`AUTH%Bearer ${TOKEN}`)
}

setWsHeartbeat(connection as WebSocketBase, 'PING')

connection.onopen = async () => {
  await sendAuth()
}

/* Force test event to be send back to client */
async function sendPush(entity: string, data: VehicleEvent | Telemetry) {
  const client = getClient()
  return client.send(`PUSH%${entity}%${JSON.stringify(data)}`)
}

export function writeTelemetry(telemetry: Telemetry) {
  return sendPush('TELEMETRIES', telemetry)
}

export function writeEvent(event: VehicleEvent) {
  return sendPush('EVENTS', event)
}
