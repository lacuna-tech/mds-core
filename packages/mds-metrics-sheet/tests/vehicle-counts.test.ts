import Sinon from 'sinon'
import assert from 'assert'
import log from '@mds-core/mds-logger'
import * as MetricsLogUtils from '../metrics-log-utils'
import * as VehicleCounts from '../vehicle-counts'
import { VehicleCountRow } from '../types'
import { reportProviders } from '../shared-utils'

const getFakeVehicleCounts = () => {
  const fakeVehicleCounts = [] as VehicleCountRow[]
  const NUM_FAKE_VEHICLE_COUNTS = 10
  for (let i = 0; i < NUM_FAKE_VEHICLE_COUNTS; i++) {
    fakeVehicleCounts.push({
      provider_id: reportProviders[i % reportProviders.length]
    } as VehicleCountRow)
  }
  fakeVehicleCounts[0].provider_id = 'fake-provider-id'
  return fakeVehicleCounts
}

const getFakeProviderMetrics = () => {
  return {
    lastDayStats: {},
    vehicleCounts: getFakeVehicleCounts()
  }
}

describe('Vehicle Counts', () => {
  describe('VehicleCountsHandler', () => {
    it('Initializes properly', async () => {
      const fakeGetProviderMetrics = Sinon.fake.resolves('it worked')
      Sinon.replace(MetricsLogUtils, 'getProviderMetrics', fakeGetProviderMetrics)
      const fakeAppendSheet = Sinon.fake.resolves('it worked')
      Sinon.replace(MetricsLogUtils, 'appendSheet', fakeAppendSheet)
      const fakeMapToRow = Sinon.fake.returns('it worked')
      Sinon.replace(VehicleCounts, 'mapProviderMetricsToVehicleCountRows', fakeMapToRow)
      await VehicleCounts.VehicleCountsHandler()
      assert.strictEqual(fakeGetProviderMetrics.calledOnceWithExactly(0), true, 'getProviderMetrics() called')
      assert.strictEqual(fakeMapToRow.calledOnce, true)
      assert.strictEqual(fakeAppendSheet.calledOnceWith('Vehicle Counts'), true, 'appendSheet() called')
      Sinon.restore()
    })

    it('Fails gracefully', async () => {
      const fakeGetProviderMetrics = Sinon.fake.rejects('it-broke')
      Sinon.replace(MetricsLogUtils, 'getProviderMetrics', fakeGetProviderMetrics)
      const fakeLogError = Sinon.fake.resolves('fake-error-logged')
      Sinon.replace(log, 'error', fakeLogError)
      await VehicleCounts.VehicleCountsHandler()
      assert.strictEqual(fakeGetProviderMetrics.calledOnceWithExactly(0), true, 'getProviderMetrics() called')
      assert.strictEqual(fakeLogError.calledOnce, true, 'error logged')
      Sinon.restore()
    })
  })

  describe('mapProviderMetricsToVehicleCountRows()', () => {
    it('Maps metrics to vehicle count rows', () => {
      const fakeProviderMetrics = getFakeProviderMetrics()
      const fakeMapRow = Sinon.fake.returns('fake-row')
      Sinon.replace(VehicleCounts, 'mapRow', fakeMapRow)
      const rows = VehicleCounts.mapProviderMetricsToVehicleCountRows(fakeProviderMetrics)
      const expectedRows = [
        'fake-row',
        'fake-row',
        'fake-row',
        'fake-row',
        'fake-row',
        'fake-row',
        'fake-row',
        'fake-row',
        'fake-row'
      ]
      assert.deepStrictEqual(rows, expectedRows)
      Sinon.restore()
    })
  })
})
