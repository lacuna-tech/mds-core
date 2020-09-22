import assert from 'assert'
import { VehicleEvent_v1_0_0, VehicleEvent_v0_4_1 } from '../../transformers/@types'

import { convert_v1_0_0_vehicle_event_to_v0_4_1, convert_v0_4_1_vehicle_event_to_v1_0_0 } from '../../transformers'

const TIME = Date.now()
const DEVICE_ID = '6161580a-a839-44f4-a701-8312d29e2640'
const PROVIDER_ID = 'c4bb9cca-de3f-42fe-82dc-e25ca6e9f724'
const STOP_ID = '57818d48-08a8-4367-a707-81a6b4bee32c'

describe('Test transformers', () => {
  it('spot checks the transformation between v0.4.1 and v1.0.0 VehicleEvent types', done => {
    it('checks the provider_pick_up and charge combo translate correctly', finished => {
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
      finished()
    })

    it('checks that the service_end and low_battery combo translate correctly', finished => {
      const event: VehicleEvent_v0_4_1 = {
        device_id: DEVICE_ID,
        provider_id: PROVIDER_ID,
        timestamp: TIME,
        event_type: 'service_end',
        event_type_reason: 'low_battery',
        recorded: TIME
      }

      const transformedEvent = convert_v0_4_1_vehicle_event_to_v1_0_0(event)
      assert.deepEqual(transformedEvent, {
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
      finished()
    })

    it('verifies the translation of trip_enter to on_trip', finished => {
      const event: VehicleEvent_v0_4_1 = {
        device_id: DEVICE_ID,
        provider_id: PROVIDER_ID,
        timestamp: TIME,
        event_type: 'trip_enter',
        recorded: TIME
      }

      const transformedEvent = convert_v0_4_1_vehicle_event_to_v1_0_0(event)

      assert.deepEqual(transformedEvent, {
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
      finished()
    })

    done()
  })

  it('spot checks the transformations between v1.0.0 VehicleEvent and v0.4.1 VehicleEvent when there are multiple event types', done => {
    const eventA: VehicleEvent_v1_0_0 = {
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

    const eventB: VehicleEvent_v1_0_0 = {
      device_id: DEVICE_ID,
      provider_id: PROVIDER_ID,
      timestamp: TIME,
      vehicle_state: 'available',
      event_types: ['comms_lost', 'comms_restored'],
      telemetry: {
        provider_id: PROVIDER_ID,
        device_id: DEVICE_ID,
        timestamp: TIME,
        gps: {
          lat: 1000,
          lng: 1000,
          speed: 1,
          hdop: 5,
          heading: 5
        },
        stop_id: STOP_ID
      },
      recorded: TIME
    }

    const { 0: converted_eventB_1, 1: converted_eventB_2 } = convert_v1_0_0_vehicle_event_to_v0_4_1(eventB)
    assert.deepEqual(converted_eventB_1.event_type, 'no_backconversion_available')
    assert.deepEqual(converted_eventB_2.event_type, 'no_backconversion_available')
    assert.deepEqual(converted_eventB_2.telemetry, {
      provider_id: PROVIDER_ID,
      device_id: DEVICE_ID,
      timestamp: TIME,
      gps: {
        lat: 1000,
        lng: 1000,
        speed: 1,
        hdop: 5,
        heading: 5
      }
    })
    done()
  })
})
