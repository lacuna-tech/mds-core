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

import { Column, Entity, Index } from 'typeorm'
import { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { UUID } from '@mds-core/mds-types'

@Entity('collector-messages')
export class CollectorMessageEntity extends IdentityColumn(RecordedColumn(class {}), { primary: true }) {
  @Column('varchar', { length: 255 })
  @Index()
  schema_id: string

  @Column('uuid')
  producer_id: UUID

  @Column('json')
  message: {}
}

export type CollectorMessageEntityModel = CollectorMessageEntity

export type CollectorMessageEntityCreateModel = Omit<
  CollectorMessageEntityModel,
  keyof RecordedColumn | keyof IdentityColumn
> &
  Partial<Pick<CollectorMessageEntityModel, keyof RecordedColumn>>
