import Sinon from 'sinon'
import assert from 'assert'
import log from '@mds-core/mds-logger'
import * as MetricsLogUtils from '../metrics-log-utils'
import { MetricsLogHandler } from '../metrics-log'

describe('MDS Metrics log', () => {
  describe('MetricsLogHandler', () => {
    it('Initializes properly', async () => {
      const fakeGetProviderMetrics = Sinon.fake.resolves('it worked')
      Sinon.replace(MetricsLogUtils, 'getProviderMetrics', fakeGetProviderMetrics)
      const fakeAppendSheet = Sinon.fake.resolves('it worked')
      Sinon.replace(MetricsLogUtils, 'appendSheet', fakeAppendSheet)
      await MetricsLogHandler()
      assert.strictEqual(fakeGetProviderMetrics.calledOnceWithExactly(0), true, 'getProviderMetrics() called')
      assert.strictEqual(fakeAppendSheet.calledOnceWith('Metrics Log'), true, 'appendSheet() called')
      Sinon.restore()
    })

    it('Fails gracefully', async () => {
      const fakeGetProviderMetrics = Sinon.fake.rejects('it-broke')
      Sinon.replace(MetricsLogUtils, 'getProviderMetrics', fakeGetProviderMetrics)
      const fakeLogError = Sinon.fake.resolves('fake-error-logged')
      Sinon.replace(log, 'error', fakeLogError)
      await MetricsLogHandler()
      assert.strictEqual(fakeGetProviderMetrics.calledOnceWithExactly(0), true, 'getProviderMetrics() called')
      assert.strictEqual(fakeLogError.calledOnceWith('MetricsLogHandler'), true, 'getProviderMetrics() called')
      Sinon.restore()
    })
  })
})
