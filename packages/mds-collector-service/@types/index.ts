/**
 * Copyright 2021 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RpcRoute, RpcServiceDefinition } from '@mds-core/mds-rpc-common'
import { DomainModelCreate } from '@mds-core/mds-repository'
import { Timestamp, UUID } from '@mds-core/mds-types'

export interface CollectorMessageDomainModel {
  schema_id: string
  producer_id: UUID
  message: {}
  recorded: Timestamp
}

export type CollectorMessageDomainCreateModel = DomainModelCreate<Omit<CollectorMessageDomainModel, 'recorded'>>

export interface CollectorService {
  getMessageSchema: (schema_id: CollectorMessageDomainModel['schema_id']) => {}
  writeSchemaMessages: (
    schema_id: CollectorMessageDomainModel['schema_id'],
    producer_id: CollectorMessageDomainModel['producer_id'],
    messages: Array<CollectorMessageDomainModel['message']>
  ) => Array<CollectorMessageDomainModel>
}

export const CollectorServiceRpcDefinition: RpcServiceDefinition<CollectorService> = {
  getMessageSchema: RpcRoute<CollectorService['getMessageSchema']>(),
  writeSchemaMessages: RpcRoute<CollectorService['writeSchemaMessages']>()
}
