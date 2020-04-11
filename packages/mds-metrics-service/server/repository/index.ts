/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { InsertReturning } from '@mds-core/mds-orm/types'
import { DeepPartial, Between } from 'typeorm'
import { timeframe } from '@mds-core/mds-utils'
import { entityPropertyFilter } from '@mds-core/mds-orm/utils'
import { ReadWriteRepository } from '@mds-core/mds-orm'
import { MetricEntity } from './entities'
import { ReadMetricsOptions } from '../../@types'
import * as migrations from './migrations'

export const MetricsReadWriteRepository = ReadWriteRepository(
  'metrics-repository',
  connect => {
    return {
      readMetrics: async ({
        name,
        time_bin_size,
        time_bin_start,
        time_bin_end,
        provider_id,
        geography_id,
        vehicle_type
      }: ReadMetricsOptions): Promise<MetricEntity[]> => {
        const connection = await connect('rw')
        const entities = await connection.getRepository(MetricEntity).find({
          where: {
            name,
            time_bin_size,
            time_bin_start: Between(
              timeframe(time_bin_size, time_bin_start).start_time,
              timeframe(time_bin_size, time_bin_end ?? time_bin_start).end_time
            ),
            ...entityPropertyFilter<MetricEntity, 'provider_id'>('provider_id', provider_id),
            ...entityPropertyFilter<MetricEntity, 'geography_id'>('geography_id', geography_id),
            ...entityPropertyFilter<MetricEntity, 'vehicle_type'>('vehicle_type', vehicle_type)
          }
        })
        return entities
      },
      writeMetrics: async (metrics: DeepPartial<MetricEntity>[]): Promise<MetricEntity[]> => {
        const connection = await connect('rw')
        const { raw: entities }: InsertReturning<MetricEntity> = await connection
          .getRepository(MetricEntity)
          .createQueryBuilder()
          .insert()
          .values(metrics)
          .returning('*')
          .execute()
        return entities
      }
    }
  },
  {
    entities: [MetricEntity],
    migrations: Object.values(migrations),
    migrationsTableName: 'migrations_metrics'
  }
)
