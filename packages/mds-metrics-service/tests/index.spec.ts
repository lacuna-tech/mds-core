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
import { minutes, hours, timeframe } from '@mds-core/mds-utils'
import { VEHICLE_TYPE } from '@mds-core/mds-types'
import { MetricsService, MetricDomainModel } from '../index'

const TEST_METRIC_NAME = 'test.metric'

function* GenerateUUID(count: number) {
  for (let p = 0; p < count; p++) {
    yield uuid()
  }
}

const TEST_TIME_BIN_SIZES = [minutes(5), minutes(15), hours(1)]
const TEST_PROVIDER_IDS = [...GenerateUUID(6)]
const TEST_GEOGRAPHY_IDS = [...GenerateUUID(10)]
const TEST_VEHICLE_TYPES: VEHICLE_TYPE[] = ['scooter', 'bicycle']
const TEST_TIMESTAMPS = [Date.now()]

function* GenerateValues(maxLength: number, maxValue: number): Generator<number> {
  const length = Math.floor(Math.random() * (maxLength + 1))
  for (let i = 0; i < length; i++) {
    yield Math.floor(Math.random() * (maxValue + 1))
  }
}

type MetricDomainAggregate = Pick<MetricDomainModel, 'count' | 'sum' | 'min' | 'max' | 'avg'>

const AggregateValues = (...values: number[]): MetricDomainAggregate => {
  const count = values.length
  const sum = values.reduce((total, value) => total + value, 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = sum / count
  return { count, sum, min, max, avg }
}

// const RollupAggregates = (metrics: MetricDomainAggregate[]): MetricDomainAggregate => {
//   const count = metrics.reduce((total, { count: value }) => total + value, 0)
//   const sum = metrics.reduce((total, { sum: value }) => total + value, 0)
//   const min = Math.min(...metrics.map(({ min: value }) => value))
//   const max = Math.max(...metrics.map(({ max: value }) => value))
//   const avg = sum / count
//   return { count, sum, min, max, avg }
// }

function* GenerateMetrics(): Generator<MetricDomainModel> {
  for (const time_bin_size of TEST_TIME_BIN_SIZES)
    for (const time_bin_start of TEST_TIMESTAMPS.map(timestamp => timeframe(time_bin_size, timestamp).start_time)) {
      for (const provider_id of TEST_PROVIDER_IDS) {
        for (const geography_id of TEST_GEOGRAPHY_IDS) {
          for (const vehicle_type of TEST_VEHICLE_TYPES) {
            yield {
              name: TEST_METRIC_NAME,
              time_bin_size,
              time_bin_start,
              provider_id,
              geography_id,
              vehicle_type,
              ...AggregateValues(...GenerateValues(50, 100))
            }
          }
        }
      }
    }
}

const TEST_METRICS = [...GenerateMetrics()]

describe('Metrics Service', () => {
  before(async () => {
    await MetricsService.startup()
  })

  it(`Generate ${TEST_METRICS.length} Metrics`, async () => {
    const [error, metrics] = await MetricsService.writeMetrics(TEST_METRICS)
    test.value(metrics).isNot(null)
    test.value(metrics?.length).is(TEST_METRICS.length)
    test.value(error).is(null)
  })

  it(`Query Metrics`, async () => {
    const [time_bin_size] = TEST_TIME_BIN_SIZES
    const [timestamp] = TEST_TIMESTAMPS
    const { start_time, end_time } = timeframe(time_bin_size, timestamp)
    const [error, metrics] = await MetricsService.readMetrics({
      name: TEST_METRIC_NAME,
      time_bin_size,
      start_time: timestamp
    })
    test.value(metrics).isNot(null)
    test
      .value(metrics?.length)
      .is(
        TEST_METRICS.filter(
          metric =>
            metric.time_bin_size === time_bin_size &&
            metric.time_bin_start >= start_time &&
            metric.time_bin_start <= end_time
        ).length
      )
    test.value(error).is(null)
  })

  it(`Query Metrics (provider_id)`, async () => {
    const [time_bin_size] = TEST_TIME_BIN_SIZES
    const [timestamp] = TEST_TIMESTAMPS
    const { start_time, end_time } = timeframe(time_bin_size, timestamp)
    const [provider_id] = TEST_PROVIDER_IDS
    const [error, metrics] = await MetricsService.readMetrics(
      {
        name: TEST_METRIC_NAME,
        time_bin_size,
        start_time: timestamp
      },
      { provider_id }
    )
    test.value(metrics).isNot(null)
    test
      .value(metrics?.length)
      .is(
        TEST_METRICS.filter(
          metric =>
            metric.time_bin_size === time_bin_size &&
            metric.time_bin_start >= start_time &&
            metric.time_bin_start <= end_time &&
            metric.provider_id === provider_id
        ).length
      )
    test.value(error).is(null)
  })

  it(`Query Metrics (provider_id, geography_id)`, async () => {
    const [, time_bin_size] = TEST_TIME_BIN_SIZES
    const [timestamp] = TEST_TIMESTAMPS
    const { start_time, end_time } = timeframe(time_bin_size, timestamp)
    const [provider_id] = TEST_PROVIDER_IDS
    const [geography_id] = TEST_GEOGRAPHY_IDS
    const [error, metrics] = await MetricsService.readMetrics(
      {
        name: TEST_METRIC_NAME,
        time_bin_size,
        start_time: timestamp
      },
      { provider_id, geography_id }
    )
    test.value(metrics).isNot(null)
    test
      .value(metrics?.length)
      .is(
        TEST_METRICS.filter(
          metric =>
            metric.time_bin_size === time_bin_size &&
            metric.time_bin_start >= start_time &&
            metric.time_bin_start <= end_time &&
            metric.provider_id === provider_id &&
            metric.geography_id === geography_id
        ).length
      )
    test.value(error).is(null)
  })

  it(`Query Metrics (provider_id, geography_id, vehicle_type)`, async () => {
    const [, , time_bin_size] = TEST_TIME_BIN_SIZES
    const [timestamp] = TEST_TIMESTAMPS
    const { start_time, end_time } = timeframe(time_bin_size, timestamp)
    const [provider_id] = TEST_PROVIDER_IDS
    const [geography_id] = TEST_GEOGRAPHY_IDS
    const [vehicle_type] = TEST_VEHICLE_TYPES
    const [error, metrics] = await MetricsService.readMetrics(
      {
        name: TEST_METRIC_NAME,
        time_bin_size,
        start_time: timestamp
      },
      { provider_id, geography_id, vehicle_type }
    )
    test.value(metrics).isNot(null)
    test
      .value(metrics?.length)
      .is(
        TEST_METRICS.filter(
          metric =>
            metric.time_bin_size === time_bin_size &&
            metric.time_bin_start >= start_time &&
            metric.time_bin_start <= end_time &&
            metric.provider_id === provider_id &&
            metric.geography_id === geography_id &&
            metric.vehicle_type === vehicle_type
        ).length
      )
    test.value(error).is(null)
  })

  after(async () => {
    await MetricsService.shutdown()
  })
})
