import Sinon from 'sinon'
import assert from 'assert'
import cache from '@mds-core/mds-cache'
import { StateEntry, TripEvent, Timestamp } from '@mds-core/mds-types'
import * as procEvent from '../src/proc-event'
import * as procEventUtils from '../src/utils'

const getMockedTripEvent = (event_type: string, timestamp: Timestamp) => {
  const tripStartA = ({ event_type, timestamp } as unknown) as TripEvent
  return tripStartA
}

const getMockedTripData = () => {
  const tripStartA = getMockedTripEvent('trip_start', 42)
  const tripStartB = getMockedTripEvent('trip_start', 43)

  const trips = {
    'trip-one': [tripStartA],
    'trip-two': [tripStartB]
  }

  return trips
}

describe('Proc Event', () => {
  describe('findTripStart()', () => {
    it('Errors out if no trip start events are found', () => {
      assert.throws(() => {
        procEventUtils.findTripStart([])
      })
    })

    it('Finds trip_start', () => {
      const event = ({ event_type: 'trip_start' } as unknown) as TripEvent
      assert.deepStrictEqual(procEventUtils.findTripStart([event]), event)
    })

    it('Finds trip_enter', () => {
      const event = ({ event_type: 'trip_enter' } as unknown) as TripEvent
      assert.deepStrictEqual(procEventUtils.findTripStart([event]), event)
    })
  })

  describe('getSortedTripStarts()', () => {
    it('Sorts trip start events by timestamp', () => {
      const trips = getMockedTripData()

      const result = procEventUtils.getSortedTripStarts(trips)
      const expected = [
        { tripId: 'trip-two', tripStart: trips['trip-two'][0] },
        { tripId: 'trip-one', tripStart: trips['trip-one'][0] }
      ]
      assert.deepStrictEqual(result, expected)
    })
  })

  describe('getTripId()', () => {
    it('Returns null when there are no prior trips', async () => {
      const fakeReadTripsEvents = Sinon.fake.resolves(null)
      Sinon.replace(cache, 'readTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {} as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })

    it('Returns null when it fails to find trip events', async () => {
      const fakeReadTripsEvents = Sinon.fake.resolves({})
      Sinon.replace(cache, 'readTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {} as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })

    it('Finds the timestamp match', async () => {
      const trips = getMockedTripData()
      const fakeReadTripsEvents = Sinon.fake.resolves(trips)
      Sinon.replace(cache, 'readTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {
        timestamp: 44
      } as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, 'trip-two')
      Sinon.restore()
    })

    it('Does not find matching timestamp', async () => {
      const trips = getMockedTripData()
      const fakeReadTripsEvents = Sinon.fake.resolves(trips)
      Sinon.replace(cache, 'readTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {
        timestamp: 41
      } as StateEntry
      const result = await procEventUtils.getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })
  })

  describe('processTripTelemetry()', () => {
    it('Returns false if unable to match', async () => {
      const fakeGetTripId = Sinon.fake.resolves(null)
      Sinon.replace(procEventUtils, 'getTripId', fakeGetTripId)
      const fakeDeviceState: StateEntry = {
        timestamp: 41,
        type: 'mds.telemetry'
      } as StateEntry
      const result = await procEvent.processTripTelemetry(fakeDeviceState)
      assert.strictEqual(result, false)
      Sinon.restore()
    })

    it('Writes to trip map hash', async () => {
      const fakeGetTripId = Sinon.fake.resolves('fake-trip-id')
      Sinon.replace(procEventUtils, 'getTripId', fakeGetTripId)

      const fakeReadTripsTelemetry = Sinon.fake.resolves(null)
      Sinon.replace(cache, 'readTripsTelemetry', fakeReadTripsTelemetry)

      const fakeWriteTripsTelemetry = Sinon.fake.resolves('foo')
      Sinon.replace(cache, 'writeTripsTelemetry', fakeWriteTripsTelemetry)

      const fakeDeviceState: StateEntry = {
        timestamp: 41,
        type: 'mds.telemetry',
        provider_id: 'fake-provider-id',
        device_id: 'fake-device-id'
      } as StateEntry
      const result = await procEvent.processTripTelemetry(fakeDeviceState)
      assert.strictEqual(result, true)
      assert.strictEqual(fakeWriteTripsTelemetry.args[0][0], `${fakeDeviceState.provider_id}:${fakeDeviceState.device_id}`)
      const expected = {
        'fake-trip-id':
        [ { timestamp: 41,
            latitude: null,
            longitude: null,
            annotation_version: undefined,
            annotation: undefined,
            service_area_id: undefined } ]
      }
      assert.deepStrictEqual(fakeWriteTripsTelemetry.args[0][1], expected)
      Sinon.restore()
    })
  })
})
