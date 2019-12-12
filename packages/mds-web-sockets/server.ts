import log from '@mds-core/mds-logger'
import { makeDevices, makeEventsWithTelemetry, makeTelemetry } from '@mds-core/mds-test-data'
import { now } from '@mds-core/mds-utils'
import WebSocket from 'ws'
import { setWsHeartbeat } from 'ws-heartbeat/server'
import { Telemetry, VehicleEvent } from '@mds-core/mds-types'
import { ApiServer } from '@mds-core/mds-api-server'
import { Clients } from './clients'

const {
  env: { npm_package_name, PORT = 4001 }
} = process

const server = ApiServer(app => app).listen(PORT, () => log.info(`${npm_package_name} running on port ${PORT}`))

const wss = new WebSocket.Server({ server })

setWsHeartbeat(wss, (ws, data) => {
  if (data === 'PING') {
    ws.send('PONG')
  }
}, 60000)

const clients = new Clients()

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

function pushToClients(entity: string, message: string) {
  if (clients.subList[entity]) {
    clients.subList[entity].map(client => {
      client.send(`${entity}%${message}`)
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
      .split('%')
    const [header, ...args] = message

    if (header === 'PUSH') {
      if (clients.isAuthenticated(ws)) {
        if (args.length === 2) {
        const [entity, data] = args
        switch (entity) {
          case ('EVENTS'): {
            const event = JSON.parse(data)
            return writeEvent(event)
          }
          case ('TELEMETRIES'): {
            const telemetry = JSON.parse(data)
            return writeTelemetry(telemetry)
          }
          default: {
            return ws.send(`Invalid entity: ${entity}`)
          }
        }
      } /* FIXME: Remove before merging. Used for testing only. */  else {
        const devices = makeDevices(200, now())
        const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, 'trip_start')
        const telemetries = makeTelemetry(devices, now())
        events.forEach(writeEvent)
        telemetries.forEach(writeTelemetry)
        return
      }
      }
    }

    if (header === 'AUTH') {
      const [token] = args
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
