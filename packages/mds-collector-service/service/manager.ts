import { RpcServer } from '@mds-core/mds-rpc-common'
import { CollectorServiceProvider } from './provider'
import { CollectorServiceClient } from '../client'
import { CollectorServiceRpcDefinition } from '../@types'

export const CollectorServiceManager = RpcServer(
  CollectorServiceRpcDefinition,
  {
    onStart: CollectorServiceProvider.start,
    onStop: CollectorServiceProvider.stop
  },
  {
    getSchema: args => CollectorServiceProvider.getSchema(...args)
  },
  {
    port: process.env.COLLECTOR_SERVICE_RPC_PORT,
    repl: {
      port: process.env.COLLECTOR_SERVICE_REPL_PORT,
      context: { client: CollectorServiceClient }
    }
  }
)
