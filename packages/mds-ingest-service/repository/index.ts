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

import { InsertReturning, ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import { Enum, PROPULSION_TYPE, Timestamp, UUID, VEHICLE_EVENT, VEHICLE_STATE, VEHICLE_TYPE } from '@mds-core/mds-types'
import { isUUID } from '@mds-core/mds-utils'
import {
  EventDomainModel,
  EventDomainCreateModel,
  TelemetryDomainCreateModel,
  DeviceDomainCreateModel
} from '../@types'
import entities from './entities'
import { DeviceEntity } from './entities/device-entity'
import { EventEntity } from './entities/event-entity'
import { TelemetryEntity } from './entities/telemetry-entity'
import {
  DeviceDomainToEntityCreate,
  DeviceEntityToDomain,
  EventDomainToEntityCreate,
  EventEntityToDomain,
  TelemetryDomainToEntityCreate,
  TelemetryEntityToDomain
} from './mappers'
import migrations from './migrations'

/**
 * Aborts execution if not running under a test environment.
 */
const testEnvSafeguard = () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`This method is only supported when executing tests`)
  }
}

const GROUPING_TYPES = Enum('latest_per_vehicle', 'latest_per_trip', 'all_events')
export type GROUPING_TYPE = keyof typeof GROUPING_TYPES

export type TimeRange = {
  start: Timestamp
  end: Timestamp
}
export interface GetVehicleEventsFilterParams {
  vehicle_types?: VEHICLE_TYPE[]
  propulsion_types?: PROPULSION_TYPE[]
  provider_ids?: UUID[]
  vehicle_states?: VEHICLE_STATE[]
  time_range: TimeRange
  grouping_type: GROUPING_TYPE
  device_or_vehicle_id?: string // Match on device_id or vehicle_id
  device_ids?: UUID[]
  event_types?: VEHICLE_EVENT[]
  geography_ids?: UUID[]
}
class IngestReadWriteRepository extends ReadWriteRepository {
  constructor() {
    super('ingest', { entities, migrations })
  }

  public createEvents = async (events: EventDomainCreateModel[]) => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { raw: entities }: InsertReturning<EventEntity> = await connection
        .getRepository(EventEntity)
        .createQueryBuilder()
        .insert()
        .values(events.map(EventDomainToEntityCreate.mapper()))
        .returning('*')
        .execute()
      return entities.map(EventEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createTelemetries = async (events: TelemetryDomainCreateModel[]) => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { raw: entities }: InsertReturning<TelemetryEntity> = await connection
        .getRepository(TelemetryEntity)
        .createQueryBuilder()
        .insert()
        .values(events.map(TelemetryDomainToEntityCreate.mapper()))
        .returning('*')
        .execute()
      return entities.map(TelemetryEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public createDevices = async (events: DeviceDomainCreateModel[]) => {
    const { connect } = this
    try {
      const connection = await connect('rw')
      const { raw: entities }: InsertReturning<DeviceEntity> = await connection
        .getRepository(DeviceEntity)
        .createQueryBuilder()
        .insert()
        .values(events.map(DeviceDomainToEntityCreate.mapper()))
        .returning('*')
        .execute()
      return entities.map(DeviceEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public getEvents = async (params: GetVehicleEventsFilterParams): Promise<EventDomainModel[]> => {
    const { connect } = this
    const {
      time_range: { start, end },
      // geography_ids,
      grouping_type = 'latest_per_vehicle',
      event_types,
      vehicle_states,
      vehicle_types,
      device_or_vehicle_id,
      device_ids,
      propulsion_types,
      provider_ids
    } = params
    try {
      const connection = await connect('ro')

      const query = connection
        .getRepository(EventEntity)
        .createQueryBuilder('events')
        .innerJoin(qb => qb.from(DeviceEntity, 'd'), 'devices', 'devices.device_id = events.device_id')
        .leftJoinAndMapOne(
          'events.telemetry',
          TelemetryEntity,
          'telemetry',
          'telemetry.device_id = events.device_id AND telemetry.timestamp = events.telemetry_timestamp'
        )

      if (grouping_type === 'latest_per_vehicle') {
        query.innerJoin(
          qb => {
            return qb
              .select(
                'device_id, id as event_id, RANK() OVER (PARTITION BY device_id ORDER BY timestamp DESC) AS rownum'
              )
              .from(EventEntity, 'e')
              .where('timestamp >= :start AND timestamp <= :end', { start, end })
          },
          'last_device_event',
          'last_device_event.event_id = events.id AND last_device_event.rownum = 1'
        )
      }

      if (grouping_type === 'latest_per_trip') {
        query.innerJoin(
          qb => {
            return qb
              .select('trip_id, id as event_id, RANK() OVER (PARTITION BY trip_id ORDER BY timestamp DESC) AS rownum')
              .from(EventEntity, 'e')
              .where('timestamp >= :start AND timestamp <= :end', { start, end })
          },
          'last_trip_event',
          'last_trip_event.event_id = events.id AND last_trip_event.rownum = 1'
        )
      }

      if (event_types) {
        query.andWhere('events.event_types && :event_types', { event_types })
      }

      if (propulsion_types) {
        query.andWhere('devices.propulsion_types && :propulsion_types', { propulsion_types })
      }

      if (device_ids) {
        query.andWhere('events.device_id = ANY(:device_ids)', { device_ids })
      }

      if (vehicle_types) {
        query.andWhere('devices.vehicle_type = ANY(:vehicle_types)', { vehicle_types })
      }

      if (vehicle_states) {
        query.andWhere('events.vehicle_state = ANY(:vehicle_states)', { vehicle_states })
      }

      if (device_or_vehicle_id) {
        if (isUUID(device_or_vehicle_id)) {
          query.andWhere('devices.device_id = :device_or_vehicle_id', { device_or_vehicle_id })
        } else {
          query.andWhere('devices.vehicle_id = :device_or_vehicle_id', { device_or_vehicle_id })
        }
      }

      if (provider_ids && provider_ids.every(isUUID)) {
        query.andWhere('events.provider_id = ANY(:provider_ids)', { provider_ids })
      }

      const entities = await query.getMany()

      return entities.map(EventEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public deleteAll = async () => {
    testEnvSafeguard()
    const { connect } = this
    try {
      const connection = await connect('rw')
      const repos = await Promise.all(
        ['EventEntity', 'DeviceEntity', 'TelemetryEntity'].map(entity => connection.getRepository(entity))
      )
      await Promise.all(repos.map(repository => repository.query(`DELETE FROM ${repository.metadata.tableName};`)))
    } catch (error) {
      throw RepositoryError(error)
    }
  }
}

export const IngestRepository = new IngestReadWriteRepository()
