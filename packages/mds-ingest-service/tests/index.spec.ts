/* eslint-disable @typescript-eslint/no-unused-vars */
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

import { IngestServiceManager } from '../service/manager'
import { IngestServiceClient } from '../client'
import { IngestRepository } from '../repository'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import { now, uuid } from '@mds-core/mds-utils'
import { Device, VehicleEvent } from '@mds-core/mds-types'

const DEVICE_UUID = 'ec551174-f324-4251-bfed-28d9f3f473fc'
const TRIP_UUID = '1f981864-cc17-40cf-aea3-70fd985e2ea7'
const TEST_TELEMETRY = {
  device_id: DEVICE_UUID,
  provider_id: TEST1_PROVIDER_ID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    hdop: 1,
    heading: 180,
    accuracy: null,
    altitude: null,
    charge: null
  },
  charge: 0.5,
  timestamp: now()
}
const TEST_TELEMETRY2 = {
  device_id: DEVICE_UUID,
  gps: {
    lat: 37.3382,
    lng: -121.8863,
    speed: 0,
    hdop: 1,
    heading: 180,
    satellites: 10
  },
  charge: 0.5,
  timestamp: now() + 1000
}

const TEST_TAXI: Omit<Device, 'recorded'> = {
  accessibility_options: ['wheelchair_accessible'],
  device_id: uuid(),
  provider_id: TEST1_PROVIDER_ID,
  vehicle_id: 'test-id-1',
  vehicle_type: 'car',
  propulsion_types: ['electric'],
  year: 2018,
  mfgr: 'Schwinn',
  modality: 'taxi',
  model: 'Mantaray'
}

const TEST_TNC: Omit<Device, 'recorded'> = {
  accessibility_options: ['wheelchair_accessible'],
  device_id: uuid(),
  provider_id: TEST1_PROVIDER_ID,
  vehicle_id: 'test-id-1',
  vehicle_type: 'car',
  propulsion_types: ['electric'],
  year: 2018,
  mfgr: 'Schwinn',
  modality: 'tnc',
  model: 'Mantaray'
}

let testTimestamp = now()

const test_event: Omit<VehicleEvent, 'recorded' | 'provider_id'> = {
  device_id: DEVICE_UUID,
  event_types: ['decommissioned'],
  vehicle_state: 'removed',
  trip_state: null,
  timestamp: testTimestamp
}

testTimestamp += 1

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

describe('Ingest Repository Tests', () => {
  beforeAll(async () => {
    await IngestRepository.initialize()
  })

  it('Run Migrations', async () => {
    await IngestRepository.runAllMigrations()
  })

  // it('gets last event per device', () => {})

  it('Revert Migrations', async () => {
    await IngestRepository.revertAllMigrations()
  })

  afterAll(async () => {
    await IngestRepository.shutdown()
  })
})

const IngestServer = IngestServiceManager.controller()

describe('Ingest Service Tests', () => {
  beforeAll(async () => {
    await IngestServer.start()
  })

  /**
   * Clear DB after each test runs, and after the file is finished. No side-effects for you.
   */
  beforeEach(async () => {
    await IngestRepository.deleteAll()
  })

  it('Test Name Method', async () => {
    const name = await IngestServiceClient.name()
    expect(name).toEqual('mds-ingest-service')
  })

  afterAll(async () => {
    await IngestServer.stop()
  })
})
