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
import log from '@mds-core/mds-logger'

import { VehicleCountRow, ProviderMetrics, VehicleCountSpreadsheetRow } from './types'
import { appendSheet, getProviderMetrics } from './metrics-log-utils'
import { reportProviders } from './shared-utils'

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

export const mapProviderMetricsToVehicleCountRows = (providerMetrics: ProviderMetrics) => {
  const { vehicleCounts } = providerMetrics
  const rows: VehicleCountSpreadsheetRow[] = vehicleCounts
    .filter(p => reportProviders.includes(p.provider_id))
    .map(mapRow)
  return rows
}

export const VehicleCountsHandler = async () => {
  try {
    const providerMetrics = await getProviderMetrics(0)
    const rows = mapProviderMetricsToVehicleCountRows(providerMetrics)
    await appendSheet<VehicleCountSpreadsheetRow>('Vehicle Counts', rows)
  } catch (err) {
    await log.error('VehicleCountsHandler', err)
  }
}
