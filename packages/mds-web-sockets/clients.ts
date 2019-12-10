import WebSocket from 'ws'
import {BearerApiAuthorizer} from '@mds-core/mds-api-authorizer'

export class Clients {
  authenticatedClients: WebSocket[]

  subList: { [key: string]: WebSocket[] }

  authenticated: boolean

  public constructor() {
    this.subList = { EVENTS: [], TELEMETRIES: [] }
    this.authenticatedClients = []
    this.authenticated = false
    this.saveClient = this.saveClient.bind(this)
  }

  public saveClient(entities: string[], client: WebSocket) {
    if (!this.authenticatedClients.includes(client)) {
      console.log('Client is not authenticated!')
      return
    }

    entities.map(entity => {
      try {
        this.subList[entity].push(client)
      } catch {
        console.log(`failed to push ${entity}`)
      }
    })
  }

  public saveAuth(token: string, client: WebSocket) {
    console.log(`Saving auth`)
    try {
      BearerApiAuthorizer(token)
      this.authenticatedClients.push(client)
    } catch (err) {
      client.send(JSON.stringify(err))
    }
  }
}
