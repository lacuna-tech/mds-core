import WebSocket from 'ws'

export class Clients {
  clientList: { [key: string]: WebSocket[] }

  public constructor() {
    this.clientList = {}
    this.saveClient = this.saveClient.bind(this)
  }

  public saveClient(entities: string[], client: WebSocket) {
    entities.map(entity => {
      this.clientList[entity].push(client)
    })
  }
}
