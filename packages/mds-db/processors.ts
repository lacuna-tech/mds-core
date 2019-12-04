import { StateEntry, TripEntry, MetricsTableRow, Recorded, VEHICLE_EVENT } from '@mds-core/mds-types'
import schema, { TABLE_NAME } from './schema'
import { vals_sql, cols_sql, vals_list, logSql } from './sql-utils'
import { getWriteableClient, makeReadOnlyQuery } from './client'

export async function getStates(
  provider_id: string,
  start_time = 0,
  end_time: number = Date.now()
): Promise<StateEntry[]> {
  const query = `SELECT * FROM reports_device_states WHERE timestamp BETWEEN ${start_time} AND ${end_time}`
  // let query = `SELECT * FROM reports_device_states WHERE provider_id = ${provider_id} AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return makeReadOnlyQuery(query)
}

export async function getTrips(
  provider_id: string,
  start_time = 0,
  end_time: number = Date.now()
): Promise<TripEntry[]> {
  const query = `SELECT * FROM reports_trips WHERE end_time BETWEEN ${start_time} AND ${end_time}`
  // let query = `SELECT * FROM reports_trips WHERE provider_id = ${provider_id} AND end_time BETWEEN ${start_time} AND ${end_time}`
  return makeReadOnlyQuery(query)
}

export async function getTripCount(
  provider_id: string,
  start_time = 0,
  end_time: number = Date.now()
): Promise<Array<{ count: number }>> {
  const query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE type = 'event' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  // let query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE provider_id = ${provider_id} AND type = 'event' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return makeReadOnlyQuery(query)
}

export async function getVehicleTripCount(
  device_id: string,
  start_time = 0,
  end_time: number = Date.now()
): Promise<Array<{ [count: string]: number }>> {
  const query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE type = 'event' AND device_id = '${device_id}' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return makeReadOnlyQuery(query)
}

export async function getLateEventCount(
  provider_id: string,
  events: VEHICLE_EVENT[],
  start_time = 0,
  end_time: number = Date.now()
): Promise<Array<{ count: number }>> {
  const eventList = `'${events.join("','")}'`
  const query = `SELECT count(*) FROM reports_device_states WHERE event_type IN (${eventList}) AND timestamp BETWEEN ${start_time} AND ${end_time}`
  // let query = `SELECT count(*) FROM reports_device_states WHERE provider_id = ${provider_id} AND event_type IN ${events} AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return makeReadOnlyQuery(query)
}

export async function getLateTelemetryCount(
  provider_id: string,
  start_time = 0,
  end_time: number = Date.now()
): Promise<Array<{ count: number }>> {
  const query = `SELECT count(*) FROM reports_device_states WHERE type = 'telemetry' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  // let query = `SELECT count(*) FROM reports_device_states WHERE provider_id = ${provider_id} AND event_type IN ${events} AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return makeReadOnlyQuery(query)
}

export async function insertDeviceStates(state: StateEntry) {
  const client = await getWriteableClient()
  const sql = `INSERT INTO ${schema.TABLE.reports_device_states} (${cols_sql(
    schema.TABLE_COLUMNS.reports_device_states
  )}) VALUES (${vals_sql(schema.TABLE_COLUMNS.reports_device_states)}) RETURNING *`
  const values = vals_list(schema.TABLE_COLUMNS.reports_device_states, { ...state })
  await logSql(sql, values)
  const {
    rows: [recorded_state]
  }: { rows: Recorded<StateEntry>[] } = await client.query(sql, values)
  return { ...state, ...recorded_state }
}

export async function insertTrips(trip: TripEntry) {
  const client = await getWriteableClient()
  const sql = `INSERT INTO ${schema.TABLE.reports_trips} (${cols_sql(
    schema.TABLE_COLUMNS.reports_trips
  )}) VALUES (${vals_sql(schema.TABLE_COLUMNS.reports_trips)}) RETURNING *`
  const values = vals_list(schema.TABLE_COLUMNS.reports_trips, { ...trip })
  await logSql(sql, values)
  const {
    rows: [recorded_trip]
  }: { rows: Recorded<StateEntry>[] } = await client.query(sql, values)
  return { ...trip, ...recorded_trip }
}

export async function insertMetrics(metric: MetricsTableRow) {
  const client = await getWriteableClient()
  const sql = `INSERT INTO ${schema.TABLE.reports_providers} (${cols_sql(
    schema.TABLE_COLUMNS.reports_providers
  )}) VALUES (${vals_sql(schema.TABLE_COLUMNS.reports_providers)}) RETURNING *`
  const values = vals_list(schema.TABLE_COLUMNS.reports_providers, { ...metric })
  await logSql(sql, values)
  const {
    rows: [recorded_metric]
  }: { rows: Recorded<StateEntry>[] } = await client.query(sql, values)
  return { ...metric, ...recorded_metric }
}

// Temporarily keep for testing
export async function resetTable(table_name: TABLE_NAME) {
  const query = `TRUNCATE ${String(table_name)}`
  const client = await getWriteableClient()
  const results = await client.query(query)
  return results.rows
}
