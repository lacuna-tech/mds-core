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

function pushToClients(entity: string, message: string) {
  if (clients.subList[entity]) {
    clients.subList[entity].map(client => {
      client.send(`${entity},${message}`)
      client.emit(entity, message)
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function writeTelemetry(telemetry: Telemetry) {
  pushToClients('TELEMETRIES', JSON.stringify(telemetry))
}

function writeEvent(event: VehicleEvent) {
  pushToClients('EVENTS', JSON.stringify(event))
}

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: WebSocket.Data) => {
    const message = String(data)
      .trim()
      .split(',')
    const [header, ...args] = message
    if (header === 'PUSH') {
      return writeEvent({ device_id: 'foo', provider_id: 'foo', recorded: 0, timestamp: 0, event_type: 'deregister' })
    }
    if (header === 'AUTH') {
      const token = args[0]
      if (token) {
        return clients.saveAuth(token, ws)
      }
    }
    if (header === 'SUB') {
      return clients.saveClient(args, ws)
    }
    return ws.send('Invalid request!')
  })
})

// TODO: Subscribe to telemetry and event streams from KNE, and call writeTelemetry/writeEvent
