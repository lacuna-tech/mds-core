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

import test from 'unit.js'
import { v4 as uuid } from 'uuid'
import { minutes, timeframe } from '@mds-core/mds-utils'
import { MetricsService, MetricDomainModel } from '../index'

const values = [2, 3, 344, 23, 23, 23, 53, 543, 5, 243]

const TEST_METRICS: MetricDomainModel[] = [
  {
    name: 'metrics.test',
    time_bin_size: minutes(5),
    time_bin_start: timeframe(minutes(5), Date.now()).start,
    provider_id: uuid(),
    geography_id: uuid(),
    vehicle_type: 'scooter',
    count: values.length,
    sum: values.reduce((sum, value) => sum + value, 0),
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((sum, value) => sum + value, 0) / values.length
  }
]

describe('Metrics Service', () => {
  before(async () => {
    await MetricsService.startup()
  })

  it(`Write Metrics`, async () => {
    const [error, metrics] = await MetricsService.writeMetrics(TEST_METRICS)
    test.value(metrics).isNot(null)
    test.value(metrics?.length).is(TEST_METRICS.length)
    test.value(error).is(null)
  })

  it(`Read Metrics`, async () => {
    const [error, metrics] = await MetricsService.readMetrics()
    test.value(metrics).isNot(null)
    test.value(metrics?.length).is(TEST_METRICS.length)
    test.value(error).is(null)
  })

  after(async () => {
    await MetricsService.shutdown()
  })
})
