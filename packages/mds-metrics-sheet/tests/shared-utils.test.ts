import assert from 'assert'
import Sinon from 'sinon'
import requestPromise from 'request-promise'
import log from '@mds-core/mds-logger'
import { getAuthToken, getVehicleCounts, getLastDayStats } from '../shared-utils'

const getFakeToken = () => {
  return {
    access_token: 'fake-access-token'
  }
}

describe('Shared utils', () => {
  describe('getAuthToken()', () => {
    it('Fetches a token', async () => {
      const fakePost = Sinon.fake.resolves('fake-token')
      Sinon.replace(requestPromise, 'post', fakePost)
      const token = await getAuthToken()
      assert.strictEqual(token, 'fake-token')
      Sinon.restore()
    })

    it('Logs failure and returns null', async () => {
      const fakePost = Sinon.fake.rejects('fake-token')
      Sinon.replace(requestPromise, 'post', fakePost)
      const fakeLogErr = Sinon.fake.resolves('fake-err')
      Sinon.replace(log, 'error', fakeLogErr)
      const token = await getAuthToken()
      assert.strictEqual(token, null)
      assert.strictEqual(fakeLogErr.calledOnce, true)
      Sinon.restore()
    })
  })

  describe('getVehicleCounts()', () => {
    it('Fetches vehicle counts', async () => {
      const fakeGet = Sinon.fake.resolves('fake-vehicle-counts')
      Sinon.replace(requestPromise, 'get', fakeGet)
      const fakeToken = getFakeToken()
      const vehicleCounts = await getVehicleCounts(fakeToken)
      assert.strictEqual(vehicleCounts, 'fake-vehicle-counts')
      Sinon.restore()
    })

    it('Logs failure and returns null', async () => {
      const fakeGet = Sinon.fake.rejects('fake-err')
      Sinon.replace(requestPromise, 'get', fakeGet)
      const fakeLogErr = Sinon.fake.resolves('fake-err')
      Sinon.replace(log, 'error', fakeLogErr)
      const fakeToken = getFakeToken()
      const vehicleCounts = await getVehicleCounts(fakeToken)
      assert.strictEqual(vehicleCounts, null)
      assert.strictEqual(fakeLogErr.calledOnce, true)
      Sinon.restore()
    })
  })

  describe('getLastDayStats()', () => {
    it('Fetches last day stats', async () => {
      const fakeGet = Sinon.fake.resolves('fake-last-day-stats')
      Sinon.replace(requestPromise, 'get', fakeGet)
      const fakeToken = getFakeToken()
      const lastDayStats = await getLastDayStats(fakeToken)
      assert.strictEqual(lastDayStats, 'fake-last-day-stats')
      Sinon.restore()
    })

    it('Logs failure and returns null', async () => {
      const fakeGet = Sinon.fake.rejects('fake-err')
      Sinon.replace(requestPromise, 'get', fakeGet)
      const fakeLogErr = Sinon.fake.resolves('fake-err')
      Sinon.replace(log, 'error', fakeLogErr)
      const fakeToken = getFakeToken()
      const lastDayStats = await getLastDayStats(fakeToken)
      assert.strictEqual(lastDayStats, null)
      assert.strictEqual(fakeLogErr.calledOnce, true)
      Sinon.restore()
    })
  })
})
