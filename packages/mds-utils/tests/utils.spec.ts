/*
    Copyright 2019 City of Los Angeles.

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
import assert from 'assert'
import { VEHICLE_EVENTS, VehicleEvent } from '@mds-core/mds-types'
import { routeDistance, filterEmptyHelper, isStateTransitionValid, normalizeToArray } from '../utils'
import { expectedTransitions } from './state-transition-expected'

const Boston = { lat: 42.360081, lng: -71.058884 }
const LosAngeles = { lat: 34.052235, lng: -118.243683 }
const BostonToLA = 4169605.469765776

describe('Tests Utilities', () => {
  it('routeDistance: Verifies single point', (done) => {
    test.value(routeDistance([Boston])).is(0)
    done()
  })

  it('routeDistance: Verifies 2 points', (done) => {
    test.value(routeDistance([Boston, LosAngeles])).is(BostonToLA)
    done()
  })

  it('routeDistance: Verifies 2+ points', (done) => {
    test.value(routeDistance([Boston, LosAngeles, Boston])).is(BostonToLA * 2)
    done()
  })

  describe('Filter empty', () => {
    it('Filters out null/undefined elements', () => {
      const arr = [1, 2, null, 3, undefined, 4]
      const actual = arr.filter(filterEmptyHelper<number>())
      const expected = [1, 2, 3, 4]
      assert.deepStrictEqual(actual, expected)
    })

    it('Does not filter 0 or "" (empty string) or [] (empty array)', () => {
      const arr = [1, 2, '', 3, [], 0]
      const actual = arr.filter(filterEmptyHelper<number | string | Array<unknown>>())
      const expected = arr
      assert.deepStrictEqual(actual, expected)
    })

    // Can't seem to get TS to go along with Sinon.spy()
    // See https://sinonjs.org/releases/latest/spies/

    // it('Calls log.warn', () => {
    //   const spy = Sinon.spy(log.warn)
    //   const oldLogWarn = log.warn
    //   log.warn = spy

    //   const arr = [1, 2, null, 3, undefined, 4]
    //   const actual = arr.filter(filterEmptyHelper<number>())
    //   const expected = [1, 2, 3, 4]
    //   assert.deepStrictEqual(actual, expected)
    //   assert.equal(spy.calledTwice, true)
    //   Sinon.restore()
    //   log.warn = oldLogWarn
    // })
  })

  describe('Normalize to array', () => {
    it('Normalizes undefined to empty array', () => {
      assert.deepStrictEqual(normalizeToArray(undefined), [])
    })
    it('Normalizes single element into singleton array', () => {
      assert.deepStrictEqual(normalizeToArray('test'), ['test'])
    })
    it('Leaves array untouched', () => {
      assert.deepStrictEqual(normalizeToArray(['test1', 'test2']), ['test1', 'test2'])
    })
  })

  describe('State machine', () => {
    it('Tests state transitions', () => {
      const events = Object.keys(VEHICLE_EVENTS)
      for (const event_type_A of events) {
        for (const event_type_B of events) {
          const eventA = { event_type: event_type_A } as VehicleEvent
          const eventB = { event_type: event_type_B } as VehicleEvent
          const actual = isStateTransitionValid(eventA, eventB)
          const transitionKey = `${eventA.event_type}, ${eventB.event_type}`
          assert.strictEqual(actual, expectedTransitions[eventA.event_type][eventB.event_type], transitionKey)
        }
      }
    })
  })
})
