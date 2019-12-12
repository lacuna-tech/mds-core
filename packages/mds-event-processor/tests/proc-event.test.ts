import Sinon from 'sinon'
import assert from 'assert'
import cache from '@mds-core/mds-cache'
import { StateEntry } from '@mds-core/mds-types'
import { getTripId } from '../src/proc-event'

describe('Proc Event', () => {
  describe('getTripId()', () => {
    it('Returns null when there are no prior trips', async () => {
      const fakeReadTripsEvents = Sinon.fake.resolves(null)
      Sinon.replace(cache, 'readTripsEvents', fakeReadTripsEvents)
      const fakeDeviceState: StateEntry = {} as StateEntry
      const result = await getTripId(fakeDeviceState)
      assert.strictEqual(result, null)
      Sinon.restore()
    })
  })
})
