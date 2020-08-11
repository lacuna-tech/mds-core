import assert from 'assert'
import { uuid, now } from '@mds-core/mds-utils'
import { Device_v0_4_1 } from '../../transformers/@types'
import { Device_v1_0_0 } from '../../index'
import { convert_v0_4_1_device_to_1_0_0, convert_v1_0_0_device_to_0_4_1 } from '../../transformers'

const TIME = now()
const DEVICE_ID = uuid()
const PROVIDER_ID = uuid()
const VEHICLE_ID = uuid()

describe('Test transformers', () => {
  it('checks the transformation between v0.4.1 and v1.0.0 Device types', done => {
    const device: Device_v0_4_1 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      vehicle_id: VEHICLE_ID,
      type: 'scooter',
      propulsion: 'electric',
      status: 'removed',
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
      year: null,
      mfgr: null,
      model: null
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
      propulsion: 'electric',
      status: 'removed',
      recorded: TIME,
      year: 2000,
      mfgr: 'Schwinn',
      model: 'fancy'
    })
    done()
  })
})
