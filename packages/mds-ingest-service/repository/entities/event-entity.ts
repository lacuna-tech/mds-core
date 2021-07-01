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

import { BigintTransformer, IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { Nullable, Timestamp, TRIP_STATE, UUID, VEHICLE_EVENT, VEHICLE_STATE } from '@mds-core/mds-types'
import { Column, Entity, Index } from 'typeorm'
import { TelemetryEntityModel } from './telemetry-entity'

@Entity('events')
export class EventEntity extends IdentityColumn(RecordedColumn(class {})) {
  @Column('uuid', { primary: true })
  device_id: UUID

  @Column('uuid')
  provider_id: UUID

  @Column('bigint', { transformer: BigintTransformer, primary: true })
  timestamp: Timestamp

  @Column('varchar', { array: true, length: 31 })
  event_types: VEHICLE_EVENT[]

  @Column('varchar', { length: 31 })
  vehicle_state: VEHICLE_STATE

  @Column('varchar', { length: 31, nullable: true })
  trip_state: TRIP_STATE

  @Column('bigint', { transformer: BigintTransformer, nullable: true })
  telemetry_timestamp: Nullable<Timestamp>

  @Index()
  @Column('uuid', { nullable: true })
  trip_id: Nullable<UUID>

  @Column('uuid', { nullable: true })
  service_area_id: Nullable<UUID>

  telemetry?: TelemetryEntityModel
}

export type EventEntityModel = EventEntity
