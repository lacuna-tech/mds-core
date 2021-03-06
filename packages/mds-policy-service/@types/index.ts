/**
 * Copyright 2020 City of Los Angeles
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

import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcRoute, RpcServiceDefinition } from '@mds-core/mds-rpc-common'
import { BaseRule, ModalityStatesToEvents, Nullable, RULE_TYPE, Timestamp, UUID } from '@mds-core/mds-types'

export interface PolicyDomainModel {
  policy_id: UUID
  name: string
  description: string
  provider_ids: Nullable<UUID[]>
  start_date: Timestamp
  end_date: Nullable<Timestamp>
  prev_policies: Nullable<UUID[]>
  rules: BaseRule<ModalityStatesToEvents, Exclude<RULE_TYPE, 'rate'>>[]
  publish_date: Nullable<Timestamp>
}

export type PolicyDomainCreateModel = DomainModelCreate<PolicyDomainModel>

export interface PolicyMetadataDomainModel<M extends {} = {}> {
  policy_id: UUID
  policy_metadata: Nullable<M>
}

export type PolicyMetadataDomainCreateModel = DomainModelCreate<PolicyMetadataDomainModel>

export interface PolicyService {
  name: () => string
}

export const PolicyServiceDefinition: RpcServiceDefinition<PolicyService> = {
  name: RpcRoute<PolicyService['name']>()
}
