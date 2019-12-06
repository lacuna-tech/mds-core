import WebSocket from 'ws'

export class Clients {
  clientList: { [key: string]: WebSocket[] }

  public constructor() {
    this.clientList = { 'EVENTS': [], 'TELEMETRIES': [] }
    this.saveClient = this.saveClient.bind(this)
  }

  public saveClient(entities: string[], client: WebSocket) {
    console.log(entities.length)
    entities.map(entity => {
      console.log(entity)
      console.log(this.clientList)
      try {
        this.clientList[entity].push(client)
      } catch {
        console.log(`failed to push ${entity}`)
      }
    })
  }
}
