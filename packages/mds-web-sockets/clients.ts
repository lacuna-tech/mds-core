import WebSocket from 'ws'
import {BearerApiAuthorizer} from '@mds-core/mds-api-authorizer'
import { string } from '@hapi/joi'

export class Clients {
  authenticatedClients: WebSocket[]

  subList: { [key: string]: WebSocket[] }

  public constructor() {
    this.subList = { EVENTS: [], TELEMETRIES: [] }
    this.authenticatedClients = []
    this.saveClient = this.saveClient.bind(this)
  }

  public saveClient(entities: string[], client: WebSocket) {
    if (!this.authenticatedClients.includes(client)) {
      client.send('Not authenticated!')
      return
    }

    const trimmedEntities = entities.map(entity => entity.trim())

    trimmedEntities.forEach(entity => {
      try {
        this.subList[entity].push(client)
      } catch {
        console.log(`failed to push ${entity}`)
      }
    })
  }

  public saveAuth(token: string, client: WebSocket) {
    try {
      const auth = BearerApiAuthorizer(token)
      if (auth) {
        this.authenticatedClients.push(client)
        client.send('Authentication success!')
      }
      else client.send(AuthorizationError())
    } catch (err) {
      client.send(JSON.stringify(err))
    }
  }
}
