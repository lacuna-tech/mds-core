import assert from 'assert'
import Sinon from 'sinon'
import log from '@mds-core/mds-logger'
import * as metricsLogUtils from '../metrics-log-utils'
import * as sharedUtils from '../shared-utils'
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

    it('Computes `complementaryPercent()` correctly', () => {
      assert.equal(metricsLogUtils.complementaryPercent(9, 100), 0.91)
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
    describe('Retry logic', () => {
      it('Gives up after 10th try', async () => {
        await assertThrowsAsync(async () => metricsLogUtils.getProviderMetrics(10), /Error/)
      })

      it('Retries if we get a null auth token', async () => {
        const providerSpy = Sinon.spy(metricsLogUtils.getProviderMetrics)
        Sinon.replace(metricsLogUtils, 'getProviderMetrics', providerSpy)
        Sinon.replace(log, 'error', Sinon.fake.returns('fake-error-log'))
        const fakeGetAuthToken = Sinon.fake.resolves(null)
        const fakeGetVehicleCounts = Sinon.fake.resolves('fake-counts')
        const fakeGetLastDayStats = Sinon.fake.resolves('fake-stats')
        Sinon.replace(sharedUtils, 'getAuthToken', fakeGetAuthToken)
        Sinon.replace(sharedUtils, 'getVehicleCounts', fakeGetVehicleCounts)
        Sinon.replace(sharedUtils, 'getLastDayStats', fakeGetLastDayStats)
        await assertThrowsAsync(async () => metricsLogUtils.getProviderMetrics(0), /Error/)
        Sinon.restore()
      })

      it('Retries if we get a null count', async () => {
        const providerSpy = Sinon.spy(metricsLogUtils.getProviderMetrics)
        Sinon.replace(metricsLogUtils, 'getProviderMetrics', providerSpy)
        Sinon.replace(log, 'error', Sinon.fake.returns('fake-error-log'))
        const fakeGetAuthToken = Sinon.fake.resolves('fake-token')
        const fakeGetVehicleCounts = Sinon.fake.resolves(null)
        const fakeGetLastDayStats = Sinon.fake.resolves('fake-stats')
        Sinon.replace(sharedUtils, 'getAuthToken', fakeGetAuthToken)
        Sinon.replace(sharedUtils, 'getVehicleCounts', fakeGetVehicleCounts)
        Sinon.replace(sharedUtils, 'getLastDayStats', fakeGetLastDayStats)
        await assertThrowsAsync(async () => metricsLogUtils.getProviderMetrics(0), /Error/)
        Sinon.restore()
      })

      it('Retries if we get a null last day stats', async () => {
        const providerSpy = Sinon.spy(metricsLogUtils.getProviderMetrics)
        Sinon.replace(metricsLogUtils, 'getProviderMetrics', providerSpy)
        Sinon.replace(log, 'error', Sinon.fake.returns('fake-error-log'))
        const fakeGetAuthToken = Sinon.fake.resolves('fake-token')
        const fakeGetVehicleCounts = Sinon.fake.resolves('fake-count')
        const fakeGetLastDayStats = Sinon.fake.resolves(null)
        Sinon.replace(sharedUtils, 'getAuthToken', fakeGetAuthToken)
        Sinon.replace(sharedUtils, 'getVehicleCounts', fakeGetVehicleCounts)
        Sinon.replace(sharedUtils, 'getLastDayStats', fakeGetLastDayStats)
        await assertThrowsAsync(async () => metricsLogUtils.getProviderMetrics(0), /Error/)
        Sinon.restore()
      })

      it('Returns the correct payload', async () => {
        const providerSpy = Sinon.spy(metricsLogUtils.getProviderMetrics)
        Sinon.replace(metricsLogUtils, 'getProviderMetrics', providerSpy)
        Sinon.replace(log, 'error', Sinon.fake.returns('fake-error-log'))
        const fakeGetAuthToken = Sinon.fake.resolves('fake-token')
        const fakeGetVehicleCounts = Sinon.fake.resolves('fake-count')
        const fakeGetLastDayStats = Sinon.fake.resolves('fake-stats')
        Sinon.replace(sharedUtils, 'getAuthToken', fakeGetAuthToken)
        Sinon.replace(sharedUtils, 'getVehicleCounts', fakeGetVehicleCounts)
        Sinon.replace(sharedUtils, 'getLastDayStats', fakeGetLastDayStats)
        const providerMetrics = await metricsLogUtils.getProviderMetrics(0)
        assert.deepStrictEqual(providerMetrics, {
          vehicleCounts: 'fake-count',
          lastDayStats: 'fake-stats'
        })
        Sinon.restore()
      })
    })
  })
})
