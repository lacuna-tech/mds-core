import { RpcServer } from '@mds-core/mds-rpc-common'
import { GeographyServiceDefinition } from '../@types'
import { GeographyServiceClient } from '../client'
import { GeographyServiceProvider } from './provider'

export const GeographyServiceManager = RpcServer(
  GeographyServiceDefinition,
  {
    onStart: GeographyServiceProvider.start,
    onStop: GeographyServiceProvider.stop
  },
  {
    getGeographies: args => GeographyServiceProvider.getGeographies(...args),
    getGeographiesWithMetadata: args => GeographyServiceProvider.getGeographiesWithMetadata(...args),
    getGeography: args => GeographyServiceProvider.getGeography(...args),
    getGeographyWithMetadata: args => GeographyServiceProvider.getGeographyWithMetadata(...args),
    writeGeographies: args => GeographyServiceProvider.writeGeographies(...args),
    writeGeographiesMetadata: args => GeographyServiceProvider.writeGeographiesMetadata(...args)
  },
  {
    port: process.env.GEOGRAPHY_SERVICE_RPC_PORT,
    repl: {
      port: process.env.GEOGRAPHY_SERVICE_REPL_PORT,
      context: { client: GeographyServiceClient }
    }
  }
)
