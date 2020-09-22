import assert from 'assert'
import { Device_v0_4_1, Device_v1_0_0 } from '../../transformers/@types'

import { convert_v0_4_1_device_to_1_0_0, convert_v1_0_0_device_to_0_4_1 } from '../../transformers'

const TIME = Date.now()
const DEVICE_ID = '79b2f745-c9a5-4ea8-a339-dcddf9184eab'
const PROVIDER_ID = 'c5e78c3c-e816-4af0-bce4-6cf092524245'
const VEHICLE_ID = '35d8c181-e288-40b6-bf20-29a83af4e173'

describe('Test transformers', () => {
  it('checks the transformation between v0.4.1 and v1.0.0 Device types', done => {
    const device: Device_v0_4_1 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      vehicle_id: VEHICLE_ID,
      type: 'scooter',
      propulsion: ['electric'],
      status: 'removed',
      year: 2000,
      mfgr: 'Cadillac',
      model: 'luxury',
      recorded: TIME
    }

    assert.deepEqual(convert_v0_4_1_device_to_1_0_0(device), {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      vehicle_id: VEHICLE_ID,
      vehicle_type: 'scooter',
      propulsion_types: ['electric'],
      state: 'removed',
      recorded: TIME,
      year: 2000,
      mfgr: 'Cadillac',
      model: 'luxury'
    })

    done()
  })

  it('checks the transformations from v1.0.0 Device to v0.4.0', done => {
    const device: Device_v1_0_0 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      vehicle_id: VEHICLE_ID,
      vehicle_type: 'scooter',
      propulsion_types: ['electric', 'hybrid'],
      state: 'removed',
      recorded: TIME,
      year: 2000,
      mfgr: 'Schwinn',
      model: 'fancy'
    }

    assert.deepEqual(convert_v1_0_0_device_to_0_4_1(device), {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      vehicle_id: VEHICLE_ID,
      type: 'scooter',
      propulsion: ['electric', 'hybrid'],
      status: 'removed',
      recorded: TIME,
      year: 2000,
      mfgr: 'Schwinn',
      model: 'fancy'
    })
    done()
  })
})
