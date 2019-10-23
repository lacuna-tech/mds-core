import GoogleSpreadsheet from 'google-spreadsheet'

import { promisify } from 'util'
import log from '@mds-core/mds-logger'
import { VEHICLE_EVENT, EVENT_STATUS_MAP, VEHICLE_STATUS } from '@mds-core/mds-types'
import { complementaryPercent, sum } from '@mds-core/mds-utils'
import {
  LastDayStatsResponse,
  MetricsSheetRow,
  VehicleCountRow,
  GoogleSheetCreds,
  GoogleSheet,
  GoogleSheetInfo,
  SpreadsheetWorksheet,
  ProviderMetrics
} from './types'
import { reportProviders, getAuthToken, getVehicleCounts, getLastDayStats } from './shared-utils'

export function eventCountsToStatusCounts(events: { [s in VEHICLE_EVENT]: number }) {
  return (Object.keys(events) as VEHICLE_EVENT[]).reduce(
    (acc: { [s in VEHICLE_STATUS]: number }, event) => {
      const status = EVENT_STATUS_MAP[event]
      return Object.assign(acc, {
        [status]: acc[status] + events[event]
      })
    },
    {
      available: 0,
      unavailable: 0,
      reserved: 0,
      trip: 0,
      removed: 0,
      inactive: 0,
      elsewhere: 0
    }
  )
}

export const defaultToZero = (num?: number) => {
  if (num === undefined) {
    return 0
  }
  return num
}

export const mapProviderToPayload = (provider: VehicleCountRow, last: LastDayStatsResponse) => {
  const dateOptions = { timeZone: 'America/Los_Angeles', day: '2-digit', month: '2-digit', year: 'numeric' }
  const timeOptions = { timeZone: 'America/Los_Angeles', hour12: false, hour: '2-digit', minute: '2-digit' }
  const d = new Date()
  let [enters, leaves, starts, ends, start_sla, end_sla, telems, telem_sla] = [0, 0, 0, 0, 0, 0, 0, 0]
  let event_counts = { service_start: 0, provider_drop_off: 0, trip_start: 0, trip_end: 0 }
  let status_counts = {
    available: 0,
    unavailable: 0,
    reserved: 0,
    trip: 0,
    removed: 0,
    inactive: 0,
    elsewhere: 0
  }
  const { event_counts_last_24h, late_event_counts_last_24h, late_telemetry_counts_last_24h } = last[
    provider.provider_id
  ]
  if (event_counts_last_24h) {
    event_counts = event_counts_last_24h
    status_counts = eventCountsToStatusCounts(event_counts_last_24h)
    starts = event_counts_last_24h.trip_start
    ends = event_counts_last_24h.trip_end
    enters = event_counts_last_24h.trip_enter
    leaves = event_counts_last_24h.trip_leave
    telems = defaultToZero(last[provider.provider_id].telemetry_counts_last_24h)
    if (late_telemetry_counts_last_24h !== undefined && late_telemetry_counts_last_24h !== null) {
      telem_sla = complementaryPercent(late_telemetry_counts_last_24h, telems)
    }
    if (late_event_counts_last_24h !== undefined && late_event_counts_last_24h !== null) {
      start_sla = complementaryPercent(late_event_counts_last_24h.trip_start, starts)
      end_sla = complementaryPercent(late_event_counts_last_24h.trip_end, ends)
    }
  }
  return {
    date: `${d.toLocaleDateString('en-US', dateOptions)} ${d.toLocaleTimeString('en-US', timeOptions)}`,
    name: provider.provider,
    registered: provider.count,
    deployed: sum([
      provider.status.available,
      provider.status.unavailable,
      provider.status.trip,
      provider.status.reserved
    ]),
    validtrips: 'tbd', // Placeholder for next day valid trip analysis
    trips: defaultToZero(last[provider.provider_id].trips_last_24h),
    servicestart: event_counts.service_start,
    providerdropoff: event_counts.provider_drop_off,
    tripstart: starts,
    tripend: ends,
    tripenter: enters,
    tripleave: leaves,
    telemetry: telems,
    telemetrysla: telem_sla,
    tripstartsla: start_sla,
    tripendsla: end_sla,
    available: status_counts.available,
    unavailable: status_counts.unavailable,
    reserved: status_counts.reserved,
    trip: status_counts.trip,
    removed: status_counts.removed,
    inactive: status_counts.inactive,
    elsewhere: status_counts.elsewhere
  }
}

export const getProviderMetrics = async (iter: number): Promise<ProviderMetrics> => {
  /* after MAX_ITER failed iterations, give up */
  const MAX_ITER = 10
  if (iter >= MAX_ITER) {
    throw new Error(`Failed to write to sheet after ${MAX_ITER} tries!`)
  }
  // All the API call helper methods have catch blocks where they log errors
  // They are normalized to not throw and only return payload | null
  const token = await getAuthToken()
  if (token == null) {
    return getProviderMetrics(iter + 1)
  }
  const vehicleCounts = await getVehicleCounts(token)
  const lastDayStats = await getLastDayStats(token)
  if (vehicleCounts == null || lastDayStats === null) {
    return getProviderMetrics(iter + 1)
  }
  return { vehicleCounts, lastDayStats }
}

export const mapProviderMetricsToMetricsSheetRow = (providerMetrics: ProviderMetrics) => {
  const { vehicleCounts, lastDayStats } = providerMetrics
  const rows: MetricsSheetRow[] = vehicleCounts
    .filter(p => reportProviders.includes(p.provider_id))
    .map(provider => mapProviderToPayload(provider, lastDayStats))
  return rows
}

/* istanbul ignore next */
const creds: GoogleSheetCreds = {
  // TODO type this more carefully
  client_email: process.env.GOOGLE_CLIENT_EMAIL || 'foo@foo.com',
  private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.split('\\n').join('\n') : null
}

/* istanbul ignore next */
export const getSpreadsheetInstance = <RowType>(spreadsheetId: string): GoogleSheet<RowType> => {
  return new GoogleSpreadsheet(spreadsheetId)
}

export const getSpreadsheetId = (): string | null => {
  if (process.env.SPREADSHEET_ID === undefined) {
    return null
  }
  return process.env.SPREADSHEET_ID
}

export const getSpreadsheetInfo = async <RowType>(): Promise<GoogleSheetInfo<RowType> | null> => {
  const spreadsheetId = getSpreadsheetId()
  if (spreadsheetId !== null) {
    const spreadsheetInstance = getSpreadsheetInstance<RowType>(spreadsheetId)
    await promisify(spreadsheetInstance.useServiceAccountAuth)(creds)
    const info = await promisify(spreadsheetInstance.getInfo)()
    log.info(`Loaded doc: ${info.title} by ${info.author.email}`)
    return info
  }
  log.info('No SPREADSHEET_ID env var specified')
  return null
}

export const getSheet = <RowType>(
  info: GoogleSheetInfo<RowType>,
  sheetName: string
): SpreadsheetWorksheet<RowType> | null => {
  const sheet = info.worksheets.find((s: { title: string; rowCount: number }) => s.title === sheetName)
  if (sheet !== undefined) {
    log.info(`${sheetName} sheet: ${sheet.title} ${sheet.rowCount}x${sheet.colCount}`)
    return sheet
  }
  log.info(`Sheet ${sheetName} not found!`)
  return null
}

export const appendSheet = async <RowType>(sheetName: string, rows: RowType[]) => {
  const info = await getSpreadsheetInfo<RowType>()
  if (info !== null) {
    const sheet = await getSheet<RowType>(info, sheetName)
    if (sheet && sheet.title === sheetName) {
      const inserted = rows.map(insert_row => promisify(sheet.addRow)(insert_row))
      log.info(`Wrote ${inserted.length} rows.`)
      return Promise.all(inserted)
    }
  }
  log.info('Wrong sheet!')
}
