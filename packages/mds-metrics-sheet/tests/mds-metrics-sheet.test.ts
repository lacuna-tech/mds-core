import assert from 'assert'
import Sinon from 'sinon'
import requestPromise from 'request-promise'
import log from '@mds-core/mds-logger'
import * as metricsLogUtils from '../metrics-log-utils'
import { VehicleCountRow } from '../types'

import { mapRow, sumColumns } from '../vehicle-counts'

// https://stackoverflow.com/a/46957474
// TODO shim for old node, when we upgrade replace with assert.rejects()
async function assertThrowsAsync(fn: Function, regExp: RegExp) {
  let f = () => {}
  try {
    await fn()
  } catch (e) {
    f = () => {
      throw e
    }
  } finally {
    assert.throws(f, regExp)
  }
}

describe('MDS Metrics Sheet', () => {
  describe('Utility functions', () => {
    it('Maps event counts to status counts', () => {
      const event = {
        register: 42,
        service_start: 42,
        service_end: 42,
        provider_drop_off: 42,
        provider_pick_up: 42,
        agency_pick_up: 42,
        agency_drop_off: 42,
        reserve: 42,
        cancel_reservation: 42,
        trip_start: 42,
        trip_enter: 42,
        trip_leave: 42,
        trip_end: 42,
        deregister: 42
      }
      const result = metricsLogUtils.eventCountsToStatusCounts(event)
      const expected = {
        available: 210,
        elsewhere: 42,
        inactive: 42,
        removed: 126,
        reserved: 42,
        trip: 84,
        unavailable: 42
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Computes `sum()` correctly', () => {
      const arr = [1, 2, 3]
      assert.equal(metricsLogUtils.sum(arr), 6)
    })

    it('Computes `percent()` correctly', () => {
      assert.equal(metricsLogUtils.percent(9, 100), 0.91)
    })
  })

  it('Maps empty row correctly', () => {
    const areas_48h = {}
    const row = { areas_48h, provider: 'fake-provider' } as VehicleCountRow
    const actual = mapRow(row)
    const expected = { date: actual.date, name: 'fake-provider', 'Venice Area': 0 }
    assert.deepStrictEqual(actual, expected)
  })

  it('Maps filled in row correctly', () => {
    const areas_48h: VehicleCountRow['areas_48h'] = {}
    const veniceAreaKeys = ['Venice', 'Venice Beach', 'Venice Canals', 'Venice Beach Special Operations Zone']
    for (const veniceAreaKey of veniceAreaKeys) {
      areas_48h[veniceAreaKey] = 5
    }
    const row = { areas_48h, provider: 'fake-provider' } as VehicleCountRow
    const actual = mapRow(row)
    const expected = {
      date: actual.date,
      name: 'fake-provider',
      Venice: 5,
      'Venice Area': 20,
      'Venice Beach': 5,
      'Venice Beach Special Operations Zone': 5,
      'Venice Canals': 5
    }
    assert.deepStrictEqual(actual, expected)
  })

  it('Summarizes over Venice correctly', () => {
    const areas_48h: VehicleCountRow['areas_48h'] = {}
    const veniceAreaKeys = ['Venice', 'Venice Beach', 'Venice Canals', 'Venice Beach Special Operations Zone']
    for (const veniceAreaKey of veniceAreaKeys) {
      areas_48h[veniceAreaKey] = 5
    }
    const row = { areas_48h, provider: 'fake-provider' } as VehicleCountRow
    const actual = sumColumns(veniceAreaKeys, row)
    assert.strictEqual(actual, 20)
  })

  it('Summarizes over Venice correctly with undefined column entries', () => {
    const areas_48h: VehicleCountRow['areas_48h'] = {}
    const veniceAreaKeys = ['Venice', 'Venice Beach', 'Venice Canals', 'Venice Beach Special Operations Zone']
    for (const veniceAreaKey of veniceAreaKeys) {
      if (veniceAreaKey !== 'Venice') {
        areas_48h[veniceAreaKey] = 5
      }
    }
    const row = { areas_48h, provider: 'fake-provider' } as VehicleCountRow
    const actual = sumColumns(veniceAreaKeys, row)
    assert.strictEqual(actual, 15)
  })

  describe('getProviderMetrics()', () => {
    it('Retries 10 times', async () => {
      const fakeRejects = Sinon.fake.rejects('it-broke')
      Sinon.replace(requestPromise, 'post', fakeRejects)
      Sinon.replace(log, 'error', Sinon.fake.returns('fake-error-log'))
      await assertThrowsAsync(async () => metricsLogUtils.getProviderMetrics(0), /Error/)
      assert.strictEqual(fakeRejects.callCount, 10)
      Sinon.restore()
    })
  })
})
