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
  console.log('foo')
  ws.on('message', (data: string) => {
    if (data === 'boop') {
      console.log(data)
      writeEvent({ device_id: 'foo', provider_id: 'foo', recorded: 0, timestamp: 0, event_type: 'deregister' })
    }
    console.log(data)
    clients.saveClient(data.split(','), ws)
  })
})

// TODO: Subscribe to telemetry and event streams from KNE, and call writeTelemetry/writeEvent

function pushToClients(entity: string, message: string) {
  if (clients.clientList[entity]) {
    clients.clientList[entity].map(client => {
      // looks good
      // if client has subscribed lalalala
      client.send(`${entity}, ${message}`)
      client.emit(entity, message)
    })
  }
}

function writeTelemetry(telemetry: Telemetry) {
  pushToClients('TELEMETRIES', JSON.stringify(telemetry))
}

function writeEvent(event: VehicleEvent) {
  pushToClients('EVENTS', JSON.stringify(event))
}
