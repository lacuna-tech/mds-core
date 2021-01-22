import { AnySchema } from 'ajv'
import { RpcRoute, RpcServiceDefinition } from '@mds-core/mds-rpc-common'

export interface CollectorService {
  getSchema: (name: string) => AnySchema
}

export const CollectorServiceRpcDefinition: RpcServiceDefinition<CollectorService> = {
  getSchema: RpcRoute<CollectorService['getSchema']>()
}
