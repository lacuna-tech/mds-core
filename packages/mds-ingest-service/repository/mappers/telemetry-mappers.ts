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

import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { Timestamp } from '@mds-core/mds-types'
import { TelemetryDomainCreateModel, TelemetryDomainModel } from '../../@types'
import { TelemetryEntityModel } from '../entities/telemetry-entity'
import { MigratedEntityModel } from '../mixins/migrated-entity'

type TelemetryEntityToDomainOptions = Partial<{}>

export const TelemetryEntityToDomain = ModelMapper<
  TelemetryEntityModel,
  TelemetryDomainModel,
  TelemetryEntityToDomainOptions
>((entity, options) => {
  const {
    id,
    lat,
    lng,
    speed,
    heading,
    accuracy,
    altitude,
    hdop,
    satellites,
    charge,
    stop_id,
    migrated_from_source,
    migrated_from_version,
    migrated_from_id,
    ...domain
  } = entity
  return { gps: { lat, lng, speed, heading, accuracy, altitude, hdop, satellites }, charge, stop_id, ...domain }
})

type TelemetryEntityCreateOptions = Partial<{
  recorded: Timestamp
  migrated_from: MigratedEntityModel
}>

export type TelemetryEntityCreateModel = Omit<TelemetryEntityModel, keyof IdentityColumn | keyof RecordedColumn>

export const TelemetryDomainToEntityCreate = ModelMapper<
  TelemetryDomainCreateModel,
  TelemetryEntityCreateModel,
  TelemetryEntityCreateOptions
>(
  (
    {
      gps: { lat, lng, speed = null, heading = null, accuracy = null, altitude = null, hdop = null, satellites = null },
      charge = null,
      stop_id = null,
      ...domain
    },
    options
  ) => {
    const { recorded, migrated_from } = options ?? {}

    return {
      lat,
      lng,
      speed,
      heading,
      accuracy,
      altitude,
      hdop,
      satellites,
      stop_id,
      charge,
      recorded,
      migrated_from_source: migrated_from?.migrated_from_source ?? null,
      migrated_from_version: migrated_from?.migrated_from_version ?? null,
      migrated_from_id: migrated_from?.migrated_from_id ?? null,
      ...domain
    }
  }
)
