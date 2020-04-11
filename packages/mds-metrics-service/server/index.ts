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

import { ServiceProvider } from '@mds-core/mds-service-helpers'
import { MetricsServiceInterface } from '../@types'
import { WriteMetricsHandler, ReadMetricsHandler } from './handlers'
import * as repository from './repository'

export const MetricsServivceProvider: ServiceProvider<MetricsServiceInterface> = {
  start: async () => {
    await repository.initialize()
  },
  readMetrics: ReadMetricsHandler,
  writeMetrics: WriteMetricsHandler,
  stop: async () => {
    await repository.shutdown()
  }
}
