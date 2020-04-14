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

import { ServiceResponse, ServiceResult, ServiceError } from '@mds-core/mds-service-helpers'
import logger from '@mds-core/mds-logger'
import { MetricsRepository } from '../repository'
import { MetricDomainModel } from '../../@types'
import { MetricModelMapper } from './metrics-model-mapper'

export const WriteMetricsHandler = async (
  metrics: MetricDomainModel[]
): Promise<ServiceResponse<MetricDomainModel[]>> => {
  try {
    const entities = await MetricsRepository.writeMetrics(
      MetricModelMapper.toEntity({ recorded: Date.now() }).map(metrics)
    )
    return ServiceResult(MetricModelMapper.toDomain().map(entities))
  } catch (error) /* istanbul ignore next */ {
    logger.error('Error Writing Metrics', error)
    return ServiceError(error)
  }
}
