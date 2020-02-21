import { Connection, createConnections, getConnectionManager, ConnectionOptions } from 'typeorm'
import { ConnectionName, Connections } from './connections'

let connections: Connection[] | null = null

export const ConnectionManager = (options: ConnectionOptions[] = Connections()) => {
  const initialize = async () => {
    if (!connections) {
      connections = await createConnections(options)
    }
  }

  const getNamedConnection = async (name: ConnectionName) => {
    await initialize()
    const connection = getConnectionManager().get(name)
    if (!connection.isConnected) {
      await connection.connect()
    }
    return connection
  }

  const getReadOnlyConnection = async () => getNamedConnection('ro')

  const getReadWriteConnection = async () => getNamedConnection('rw')

  const shutdown = async () => {
    if (connections) {
      await Promise.all(connections.filter(connection => connection.isConnected).map(connection => connection.close()))
    }
    connections = null
  }

  return {
    initialize,
    getReadOnlyConnection,
    getReadWriteConnection,
    shutdown
  }
}
