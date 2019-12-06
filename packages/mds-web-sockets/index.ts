import log from '@mds-core/mds-logger'
import WebSocket from 'ws'
import { Telemetry, VehicleEvent } from '@mds-core/mds-types'
import { ApiServer } from '@mds-core/mds-api-server'

const {
  env: { npm_package_name, PORT = 4001 }
} = process

const server = ApiServer(app => app).listen(PORT, () => log.info(`${npm_package_name} running on port ${PORT}`))

const wss = new WebSocket.Server({ server })

let cachedWs: WebSocket | null = null

wss.on('connection', (ws: WebSocket) => {
  cachedWs = ws
})

function getClient() {
  if (!cachedWs) {
    wss.on('connection', (ws: WebSocket) => {
      cachedWs = ws
    })
  }
  return cachedWs as WebSocket
}

export function writeTelemetry(telemetry: Telemetry) {
  const ws = getClient()
  ws.emit('TELEMETRIES', JSON.stringify(telemetry))
}

export function writeEvent(event: VehicleEvent) {
  const ws = getClient()
  ws.emit('EVENTS', JSON.stringify(event))
}
