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

import { InsertReturning, ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import { CollectorMessageDomainCreateModel, CollectorMessageDomainModel } from '../@types'
import { CollectorMessageEntity, CollectorMessageEntityModel } from './entities'
import { CollectorMessageDomainToEntityCreate, CollectorMessageEntityToDomain } from './mappers'
import migrations from './migrations'

class CollectorReadWriteRepository extends ReadWriteRepository {
  public insertCollectorMessages = async (
    messages: CollectorMessageDomainCreateModel[],
    beforeCommit: () => Promise<void> = async () => undefined
  ): Promise<CollectorMessageDomainModel[]> => {
    try {
      const connection = await this.connect('rw')

      const chunks = this.asChunksForInsert(messages.map(CollectorMessageDomainToEntityCreate.mapper()))

      const results: Array<InsertReturning<CollectorMessageEntityModel>> = await connection.transaction(
        async manager => {
          const inserted = await Promise.all(
            chunks.map(chunk =>
              manager
                .getRepository(CollectorMessageEntity)
                .createQueryBuilder()
                .insert()
                .values(messages.map(CollectorMessageDomainToEntityCreate.mapper()))
                .returning('*')
                .execute()
            )
          )
          await beforeCommit()
          return inserted
        }
      )

      return results
        .reduce<Array<CollectorMessageEntity>>((entities, { raw: chunk = [] }) => entities.concat(chunk), [])
        .map(CollectorMessageEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  constructor() {
    super('collector', { entities: [CollectorMessageEntity], migrations })
  }
}

export const CollectorRepository = new CollectorReadWriteRepository()
