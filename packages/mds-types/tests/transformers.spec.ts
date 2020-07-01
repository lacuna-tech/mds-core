import test from 'unit.js'
import { uuid, now } from '@mds-core/mds-utils'
import { Timestamp, VEHICLE_EVENT } from '../index'
import { VehicleEvent_v0_4_1, VehicleEvent_v1_0_0, v0_4_1_to_v1_0_0, v1_0_0_to_v0_4_0 } from '../transformers'

const TIME = now()
const DEVICE_ID = uuid()
const PROVIDER_ID = uuid()

describe('Test transformers', () => {
  it('validates the transformation between v0.4.1 and v1.0.0 VehicleEvent types', done => {
    const event: VehicleEvent_v0_4_1 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      event_type: 'provider_pick_up',
      event_type_reason: 'low_battery',
      recorded: TIME
    }

    const transformedEvent = v0_4_1_to_v1_0_0(event)
    test.value(transformedEvent, {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'provider_pick_up',
      event_types: ['low_battery'],
      recorded: TIME
    })
    done()
  })

  it('validates the transformation between v1.0.0 VehicleEvent and v0.4.0 VehicleEvent when there are multiple event types', done => {
    const event: VehicleEvent_v1_0_0 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'provider_pick_up',
      event_types: ['low_battery', 'maintenance'],
      recorded: TIME
    }

    const v0_4_1_events = v1_0_0_to_v0_4_0(event)
    test.value(v0_4_1_events, [
      {
        device_id: DEVICE_ID,
        provider_id: PROVIDER_ID,
        timestamp: TIME,
        event_type: 'provider_pick_up',
        event_type_reason: 'low_battery',
        recorded: TIME
      },
      {
        device_id: DEVICE_ID,
        provider_id: PROVIDER_ID,
        timestamp: TIME,
        event_type: 'provider_pick_up',
        event_type_reason: 'maintenance',
        recorded: TIME
      }
    ])
    done()
  })

  it('validates the transformation between v1.0.0 VehicleType and v0.4.0 VehicleType when there are no event_types', done => {
    const event: VehicleEvent_v1_0_0 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'provider_pick_up',
      event_types: [],
      recorded: TIME
    }
    const transformedEvent = v1_0_0_to_v0_4_0(event)
    test.value(transformedEvent, {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      event_type: 'provider_pick_up',
      event_type_reason: null,
      recorded: TIME
    })
    done()
  })
})
