import logger from '@mds-core/mds-logger'
import { seconds, getEnvVar } from '@mds-core/mds-utils'
import { Json } from '@mds-core/mds-types'
import WebSocket from 'ws'
import { setWsHeartbeat } from 'ws-heartbeat/server'
import { ApiServer, HttpServer } from '@mds-core/mds-api-server'
import { initializeNatsSubscriber } from '@mds-core/mds-stream/nats/nats'
import { Clients } from './clients'
import { EntityTypes } from './types'

/**
 * Web Socket Server that pas
 * @param entityTypes - entities to pass on to clients
 */
export const WebSocketServer = <T extends readonly string[]>(entityTypes?: T) => {
  const supportedEntities = entityTypes || EntityTypes
  const server = HttpServer(ApiServer(app => app))

  logger.info('Creating WS server')
  const wss = new WebSocket.Server({ server })
  logger.info('WS Server created!')

  setWsHeartbeat(
    wss,
    (ws, data) => {
      if (data === 'PING') {
        ws.send('PONG')
      }
    },
    seconds(60)
  )

  const clients = new Clients(supportedEntities)

  function isSupported(entity: string) {
    return supportedEntities.findIndex(e => e === entity) > -1
  }

  function pushToClients(entity: string, message: string) {
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

    staleClients.forEach(client => client.close())
  }

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (data: WebSocket.Data) => {
      const message = data.toString().trim().split('%')
      const [header, ...args] = message

      /* Testing message, also useful in a NATS-less environment */
      if (header === 'PUSH') {
        if (clients.isAuthenticated(ws)) {
          if (args.length === 2) {
            const [entity, payload] = args
            // Limit messages to only supported entities
            if (isSupported(entity)) {
              await pushToClients(entity, payload)
              return
            }
            return ws.send(`Invalid entity: ${entity}`)
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

      if (header === 'PING') {
        return
      }

      return ws.send('Invalid request!')
    })
  })

  const { TENANT_ID } = getEnvVar({
    TENANT_ID: 'mds'
  })

  const processor = async (entity: string, data: Json) => {
    if (isSupported(entity)) {
      await pushToClients(entity, JSON.stringify(data))
      return
    }
    logger.error(`Unprocessable entity of type: ${entity} and data: ${JSON.stringify(data)}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  initializeNatsSubscriber({ TENANT_ID, processor })
}
