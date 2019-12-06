import log from '@mds-core/mds-logger'
import WebSocket from 'ws'
import { Telemetry, VehicleEvent } from '@mds-core/mds-types'
import { ApiServer } from '@mds-core/mds-api-server'
import { Clients } from './clients'

const {
  env: { npm_package_name, PORT = 4001 }
} = process

const server = ApiServer(app => app).listen(PORT, () => log.info(`${npm_package_name} running on port ${PORT}`))

const wss = new WebSocket.Server({ server })

const clients = new Clients()

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: string) => {
    clients.saveClient(data.split(','), ws)
  })
})

// TODO: Subscribe to telemetry and event streams from KNE, and call writeTelemetry/writeEvent

function pushToClients(entity: string, message: string) {
  clients.map(client => {
    // looks good
    // if client has subscribed lalalala
    client.emit(entity, message)
  })
}

function writeTelemetry(telemetry: Telemetry) {
  pushToClients('TELEMETRIES', JSON.stringify(telemetry))
}

function writeEvent(event: VehicleEvent) {
  pushToClients('EVENTS', JSON.stringify(event))
}
