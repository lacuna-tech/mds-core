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
import requestPromise from 'request-promise'

import log from '@mds-core/mds-logger'

import { VehicleCountResponse, VehicleCountRow } from './types'
import { appendSheet } from './metrics-log-utils'
import { reportProviders, getAuthToken } from './shared-utils'

export function sumColumns(keysToSummarize: string[], row: VehicleCountRow) {
  return keysToSummarize.reduce((acc, veniceAreaKey) => acc + row.areas_48h[veniceAreaKey] || 0, 0)
}

export function mapRow(row: VehicleCountRow) {
  const dateOptions = { timeZone: 'America/Los_Angeles', day: '2-digit', month: '2-digit', year: 'numeric' }
  const timeOptions = { timeZone: 'America/Los_Angeles', hour12: false, hour: '2-digit', minute: '2-digit' }
  const d = new Date()
  const veniceAreaKeys = ['Venice', 'Venice Beach', 'Venice Canals', 'Venice Beach Special Operations Zone']
  const veniceAreaSum = sumColumns(veniceAreaKeys, row)
  const augmentedRow = {
    'Venice Area': veniceAreaSum,
    ...row.areas_48h
  }
  return {
    date: `${d.toLocaleDateString('en-US', dateOptions)} ${d.toLocaleTimeString('en-US', timeOptions)}`,
    name: row.provider,
    ...augmentedRow
  }
}

async function getProviderMetrics(iter: number): Promise<({ date: string; name: string } & unknown)[]> {
  /* after 10 failed iterations, give up */
  if (iter >= 10) {
    throw new Error(`Failed to write to sheet after 10 tries!`)
  }

  try {
    const token = await getAuthToken()
    const counts_options = {
      uri: 'https://api.ladot.io/daily/admin/vehicle_counts',
      headers: { authorization: `Bearer ${token.access_token}` },
      json: true
    }

    const counts: VehicleCountResponse = await requestPromise(counts_options)
    const rows: ({ date: string; name: string } & unknown)[] = counts
      .filter(p => reportProviders.includes(p.provider_id))
      .map(mapRow)
    return rows
  } catch (err) {
    await log.error('getProviderMetrics', err)
    return getProviderMetrics(iter + 1)
  }
}

export const VehicleCountsHandler = async () => {
  try {
    const rows = await getProviderMetrics(0)
    await appendSheet('Vehicle Counts', rows)
  } catch (err) {
    await log.error('VehicleCountsHandler', err)
  }
}
