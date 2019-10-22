import {
  JUMP_PROVIDER_ID,
  LIME_PROVIDER_ID,
  BIRD_PROVIDER_ID,
  LYFT_PROVIDER_ID,
  WHEELS_PROVIDER_ID,
  SPIN_PROVIDER_ID,
  SHERPA_LA_PROVIDER_ID,
  BOLT_PROVIDER_ID
} from '@mds-core/mds-providers'
import log from '@mds-core/mds-logger'

import requestPromise from 'request-promise'
import { VehicleCountResponse, LastDayStatsResponse } from './types'

// The list of providers ids on which to report
export const reportProviders = [
  JUMP_PROVIDER_ID,
  LIME_PROVIDER_ID,
  BIRD_PROVIDER_ID,
  LYFT_PROVIDER_ID,
  WHEELS_PROVIDER_ID,
  SPIN_PROVIDER_ID,
  SHERPA_LA_PROVIDER_ID,
  BOLT_PROVIDER_ID
]

export interface AuthToken {
  access_token: string
}

export const getAuthToken = async (): Promise<AuthToken | null> => {
  const token_options = {
    url: `${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      audience: process.env.AUDIENCE
    },
    json: true
  }
  try {
    const token: AuthToken = await requestPromise.post(token_options)
    return token
  } catch (err) {
    await log.error(`Get auth token ${token_options.url} error`, err)
    return null
  }
}

export const getVehicleCounts = async (token: AuthToken): Promise<VehicleCountResponse | null> => {
  const counts_options = {
    url: 'https://api.ladot.io/daily/admin/vehicle_counts',
    headers: { authorization: `Bearer ${token.access_token}` },
    json: true
  }
  try {
    const counts: VehicleCountResponse = await requestPromise.get(counts_options)
    return counts
  } catch (err) {
    await log.error(`Get vehicle counts ${counts_options.url} error`, err)
    return null
  }
}

export const getLastDayStats = async (token: AuthToken): Promise<LastDayStatsResponse | null> => {
  const last_options = {
    url: 'https://api.ladot.io/daily/admin/last_day_stats_by_provider',
    headers: { authorization: `Bearer ${token.access_token}` },
    json: true
  }
  try {
    const last: LastDayStatsResponse = await requestPromise.get(last_options)
    return last
  } catch (err) {
    await log.error(`Get last day stats ${last_options.url} error`, err)
    return null
  }
}
