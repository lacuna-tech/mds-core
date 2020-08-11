import assert from 'assert'
import { uuid, now } from '@mds-core/mds-utils'
import { VehicleEvent_v0_4_1 } from '../../transformers/@types'
import { VehicleEvent } from '../../index'
import { convert_v1_0_0_vehicle_event_to_v0_4_1, convert_v0_4_1_vehicle_event_to_v1_0_0 } from '../../transformers'

const TIME = now()
const DEVICE_ID = uuid()
const PROVIDER_ID = uuid()

describe('Test transformers', () => {
  it('spot checks the transformation between v0.4.1 and v1.0.0 VehicleEvent types', done => {
    const event: VehicleEvent_v0_4_1 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      event_type: 'provider_pick_up',
      event_type_reason: 'charge',
      recorded: TIME
    }

    const transformedEvent = convert_v0_4_1_vehicle_event_to_v1_0_0(event)
    assert.deepEqual(transformedEvent, {
      delta: null,
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'removed',
      event_types: ['maintenance_pick_up'],
      recorded: TIME,
      telemetry: null,
      telemetry_timestamp: null,
      timestamp_long: null,
      trip_id: null
    })

    const event2: VehicleEvent_v0_4_1 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      event_type: 'service_end',
      event_type_reason: 'low_battery',
      recorded: TIME
    }

    const transformedEvent2 = convert_v0_4_1_vehicle_event_to_v1_0_0(event2)
    assert.deepEqual(transformedEvent2, {
      delta: null,
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'non_operational',
      event_types: ['battery_low'],
      recorded: TIME,
      telemetry: null,
      telemetry_timestamp: null,
      timestamp_long: null,
      trip_id: null
    })

    const event3: VehicleEvent_v0_4_1 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      event_type: 'trip_enter',
      recorded: TIME
    }

    const transformedEvent3 = convert_v0_4_1_vehicle_event_to_v1_0_0(event3)

    assert.deepEqual(transformedEvent3, {
      delta: null,
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'on_trip',
      event_types: ['trip_enter_jurisdiction'],
      recorded: TIME,
      telemetry: null,
      telemetry_timestamp: null,
      timestamp_long: null,
      trip_id: null
    })
    done()
  })

  it('spot checks the transformations between v1.0.0 VehicleEvent and v0.4.0 VehicleEvent when there are multiple event types', done => {
    const eventA: VehicleEvent = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'on_trip',
      event_types: ['provider_drop_off', 'trip_start'],
      recorded: TIME
    }

    const { 0: converted_eventA_1, 1: converted_eventA_2 } = convert_v1_0_0_vehicle_event_to_v0_4_1(eventA)
    assert.deepEqual(converted_eventA_1.event_type, 'provider_drop_off')
    assert.deepEqual(converted_eventA_2.event_type, 'trip_start')

    const eventB: VehicleEvent = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'available',
      event_types: ['comms_lost', 'comms_restored'],
      recorded: TIME
    }

    const { 0: converted_eventB_1, 1: converted_eventB_2 } = convert_v1_0_0_vehicle_event_to_v0_4_1(eventB)
    assert.deepEqual(converted_eventB_1.event_type, 'no_backconversion_available')
    assert.deepEqual(converted_eventB_2.event_type, 'no_backconversion_available')
    done()
  })
})
