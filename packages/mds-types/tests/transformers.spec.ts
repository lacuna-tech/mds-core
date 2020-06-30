import test from 'unit.js'
import { uuid, now } from '@mds-core/mds-utils'
import { Timestamp, VEHICLE_EVENT } from '../index'
import { VehicleEvent_v0_4_0, VehicleEvent_v1_0_0, v0_4_1_to_v1_0_0 } from '../transformers'

describe('Test transformers', () => {
  it('validates the transformation between v0.4.1 and v1.0.0 VehicleEvent types', done => {
    const time = now()
    const device_id = uuid()
    const provider_id = uuid()
    const event: VehicleEvent_v0_4_0 = {
      device_id,
      provider_id,
      timestamp: time,
      event_type: 'provider_pick_up',
      event_type_reason: 'low_battery',
      recorded: time
    }

    const transformedEvent = v0_4_1_to_v1_0_0(event)
    test.value(transformedEvent, {
      device_id,
      provider_id,
      timestamp: time,
      vehicle_state: ['provider_pick_up'],
      event_types: ['low_battery'],
      recorded: time
    })
    done()
  })
})
