import WebSocket from 'ws'
import { VehicleEvent, Telemetry } from '@mds-core/mds-types'
import { setWsHeartbeat, WebSocketBase } from 'ws-heartbeat/client'
const url = 'ws://localhost:4001'

const connection = new WebSocket(url)

const { env } = process

const { token } = env

setWsHeartbeat(connection as WebSocketBase, 'PING')

connection.onopen = async () => {
  await sendAuth()
}

/* Authenticate */
async function sendAuth() {
  return connection.send(`AUTH,${token}`)
}

/* Force test event to be send back to client */
async function sendPush(entity: string, data: VehicleEvent | Telemetry) {
  return connection.send(`PUSH,${entity},${data}`)
}

export function writeTelemetry(telemetry: Telemetry) {
  return sendPush('TELEMETRIES', telemetry)
}

export function writeEvent(event: VehicleEvent) {
  return sendPush('EVENTS', event)
}