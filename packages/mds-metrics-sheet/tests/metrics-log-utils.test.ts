import { mapProviderToPayload, appendSheet } from '../metrics-log-utils'
import { getProvider, getLastDayStatsResponse } from './utils'
import * as GoogleSheet from 'google-spreadsheet'
import assert from 'assert'
import Sinon from 'sinon'

describe('Metrics Log utils', () => {
  describe('mapProviderToPayload()', () => {
    it('Maps a provider to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      const result = mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 42,
        providerdropoff: 42,
        tripstart: 42,
        tripend: 42,
        tripenter: 42,
        tripleave: 42,
        telemetry: 5,
        telemetrysla: 0.8,
        tripstartsla: 0,
        tripendsla: 0,
        available: 210,
        unavailable: 42,
        reserved: 42,
        trip: 84,
        removed: 126,
        inactive: 42,
        elsewhere: 42
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Maps `lastDayStatsResponse` sans `event_counts_last_24h` to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      lastDayStatsResponse[provider.provider_id].event_counts_last_24h = undefined
      const result = mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 0,
        providerdropoff: 0,
        tripstart: 0,
        tripend: 0,
        tripenter: 0,
        tripleave: 0,
        telemetry: 0,
        telemetrysla: 0,
        tripstartsla: 0,
        tripendsla: 0,
        available: 0,
        unavailable: 0,
        reserved: 0,
        trip: 0,
        removed: 0,
        inactive: 0,
        elsewhere: 0
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Maps `lastDayStatsResponse` sans `late_telemetry_counts_last_24h` to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      lastDayStatsResponse[provider.provider_id].late_telemetry_counts_last_24h = undefined
      const result = mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 42,
        providerdropoff: 42,
        tripstart: 42,
        tripend: 42,
        tripenter: 42,
        tripleave: 42,
        telemetry: 5,
        telemetrysla: 0,
        tripstartsla: 0,
        tripendsla: 0,
        available: 210,
        unavailable: 42,
        reserved: 42,
        trip: 84,
        removed: 126,
        inactive: 42,
        elsewhere: 42
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Maps `lastDayStatsResponse` sans `late_event_counts_last_24h` to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      lastDayStatsResponse[provider.provider_id].late_event_counts_last_24h = undefined
      const result = mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 42,
        providerdropoff: 42,
        tripstart: 42,
        tripend: 42,
        tripenter: 42,
        tripleave: 42,
        telemetry: 5,
        telemetrysla: 0.8,
        tripstartsla: 0,
        tripendsla: 0,
        available: 210,
        unavailable: 42,
        reserved: 42,
        trip: 84,
        removed: 126,
        inactive: 42,
        elsewhere: 42
      }
      assert.deepStrictEqual(result, expected)
    })
  })

  describe('appendSheet()', () => {
    it('Does the thing', async () => {
      await appendSheet('fakeSheet', [])
      Sinon.restore()
    })
  })
})