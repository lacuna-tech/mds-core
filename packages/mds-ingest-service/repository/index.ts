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
import { UUID } from '@mds-core/mds-types'
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
        .getRepository(EventEntity)
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
        .getRepository(EventEntity)
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

  public getLastEventPerDevice = async (provider_id: UUID): Promise<EventDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      // const entities = await connection.getRepository(EventEntity).find({ where: { provider_id } })

      const entities = await connection
        .getRepository(EventEntity)
        .createQueryBuilder('events')
        .innerJoinAndSelect(
          qb => {
            return qb.select('device_id, max(timestamp) as max_time').from(EventEntity, 'e').where(provider_id)
          },
          'le',
          'le.device_id = events.device_id AND le.max_time = events.timestamp'
        )
        .getMany()

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
