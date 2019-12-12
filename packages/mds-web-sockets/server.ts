import log from '@mds-core/mds-logger'
import { makeDevices, makeEventsWithTelemetry, makeTelemetry } from '@mds-core/mds-test-data'
import { now, seconds } from '@mds-core/mds-utils'
import WebSocket from 'ws'
import { setWsHeartbeat } from 'ws-heartbeat/server'
import { Telemetry, VehicleEvent } from '@mds-core/mds-types'
import { ApiServer } from '@mds-core/mds-api-server'
import { Clients } from './clients'
import { ENTITY_TYPE } from './types'

const {
  env: { npm_package_name, PORT = 4001 }
} = process

export const WebSocketServer = () => {
  const server = ApiServer(app => app).listen(PORT, () => log.info(`${npm_package_name} running on port ${PORT}`))

  const wss = new WebSocket.Server({ server })

  setWsHeartbeat(
    wss,
    (ws, data) => {
      if (data === 'PING') {
        ws.send('PONG')
      }
    },
    seconds(60)
  )

  const clients = new Clients()

  const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

  function pushToClients(entity: ENTITY_TYPE, message: string) {
    const staleClients: WebSocket[] = []
    if (clients.subList[entity]) {
      clients.subList[entity].forEach(client => {
        if (client.readyState !== 1) staleClients.push(client)
        else {
          client.send(`${entity}%${message}`)
          client.emit(entity, message)
        }
      })
    }

    Object.keys(clients.subList).map(entityKey => {
      clients.subList[entityKey] = clients.subList[entityKey].filter(client => !staleClients.includes(client))
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function writeTelemetry(telemetry: Telemetry) {
    pushToClients('TELEMETRIES', JSON.stringify(telemetry))
  }

  function writeEvent(event: VehicleEvent) {
    pushToClients('EVENTS', JSON.stringify(event))
  }

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (data: WebSocket.Data) => {
      const message = data
        .toString()
        .trim()
        .split('%')
      const [header, ...args] = message

      if (header === 'PUSH') {
        if (clients.isAuthenticated(ws)) {
          if (args.length === 2) {
            const [entity, payload] = args
            switch (entity) {
              case 'EVENTS': {
                const event = JSON.parse(payload)
                return writeEvent(event)
              }
              case 'TELEMETRIES': {
                const telemetry = JSON.parse(payload)
                return writeTelemetry(telemetry)
              }
              default: {
                return ws.send(`Invalid entity: ${entity}`)
              }
            }
          } /* FIXME: Remove before merging. Used for testing only. */ else {
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
}
