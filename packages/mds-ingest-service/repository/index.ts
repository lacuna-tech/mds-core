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

import { ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import { UUID } from '@mds-core/mds-types'
import { EventDomainModel } from '../@types'
import entities from './entities'
import { EventEntity } from './entities/event-entity'
import { EventEntityToDomain } from './mappers'
import migrations from './migrations'

class IngestReadWriteRepository extends ReadWriteRepository {
  constructor() {
    super('ingest', { entities, migrations })
  }
  public getEvents = async (provider_id: UUID): Promise<EventDomainModel[]> => {
    const { connect } = this
    try {
      const connection = await connect('ro')
      const entities = await connection.getRepository(EventEntity).find({ where: { provider_id } })
      return entities.map(EventEntityToDomain.map)
    } catch (error) {
      throw RepositoryError(error)
    }
  }
}

export const IngestRepository = new IngestReadWriteRepository()
