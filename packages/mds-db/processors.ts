import {
  StateEntry,
  TripEntry,
  MetricsTableRow,
  Recorded,
  UUID,
  Timestamp,
  VEHICLE_TYPE,
  VEHICLE_EVENT
} from '@mds-core/mds-types'
// import { tenantId } from '@mds-core/mds-utils'
import schema from './schema'
import { vals_sql, cols_sql, vals_list, logSql, SqlVals } from './sql-utils'
import { getWriteableClient, makeReadOnlyQuery } from './client'

const tenantId = process.env.TENANT_ID ? process.env.TENANT_ID : 'mds'

export async function getStates(
  provider_id: UUID,
  vehicleType: VEHICLE_TYPE,
  start_time: Timestamp = 0,
  end_time: Timestamp = Date.now()
): Promise<StateEntry[]> {
  const vals = new SqlVals()
  const query = `SELECT * FROM reports_device_states WHERE provider_id = '${vals.add(
    provider_id
  )}' AND vehicle_type = '${vals.add(vehicleType)}' AND recorded BETWEEN ${vals.add(start_time)} AND ${vals.add(
    end_time
  )}`
  return makeReadOnlyQuery(query, vals.values())
}

export async function getTripCount(
  provider_id: UUID,
  vehicleType: VEHICLE_TYPE,
  start_time: Timestamp = 0,
  end_time: Timestamp = Date.now()
): Promise<Array<{ count: number }>> {
  const vals = new SqlVals()
  const query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE provider_id = '${vals.add(
    provider_id
  )}' AND vehicle_type = '${vals.add(vehicleType)}' AND type = '${tenantId}.event' AND recorded BETWEEN ${vals.add(
    start_time
  )} AND ${vals.add(end_time)}`
  return makeReadOnlyQuery(query, vals.values())
}

export async function getVehicleTripCount(
  device_id: UUID,
  start_time: Timestamp = 0,
  end_time: Timestamp = Date.now()
): Promise<Array<{ [count: string]: number }>> {
  const vals = new SqlVals()
  const query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE device_id = '${vals.add(
    device_id
  )}' AND type = '${tenantId}.event' AND recorded BETWEEN ${vals.add(start_time)} AND ${vals.add(end_time)}`
  return makeReadOnlyQuery(query, vals.values())
}

export async function getLateEventCount(
  provider_id: UUID,
  vehicleType: VEHICLE_TYPE,
  events: VEHICLE_EVENT[],
  SLA: number,
  start_time: Timestamp = 0,
  end_time: Timestamp = Date.now()
): Promise<Array<{ count: number; min: Timestamp; max: Timestamp; average: Timestamp }>> {
  const vals = new SqlVals()
  const eventList = `'${events.join("','")}'`
  const query = `SELECT count(*), min(recorded-timestamp), max(recorded-timestamp), avg(recorded-timestamp) FROM reports_device_states WHERE provider_id = '${vals.add(
    provider_id
  )}' AND vehicle_type = '${vals.add(vehicleType)}' AND type = '${tenantId}.event' AND event_type IN (${vals.add(
    eventList
  )}) AND recorded BETWEEN ${vals.add(start_time)} AND ${vals.add(end_time)} AND recorded-timestamp <= ${vals.add(SLA)}`
  return makeReadOnlyQuery(query, vals.values())
}

export async function getLateTelemetryCount(
  provider_id: UUID,
  vehicleType: VEHICLE_TYPE,
  SLA: number,
  start_time: Timestamp = 0,
  end_time: Timestamp = Date.now()
): Promise<Array<{ count: number; min: Timestamp; max: Timestamp; average: Timestamp }>> {
  const vals = new SqlVals()
  const query = `SELECT count(*)  FROM reports_device_states WHERE provider_id = '${vals.add(
    provider_id
  )}' AND vehicle_type = '${vals.add(vehicleType)}' AND type = '${tenantId}.telemetry' AND recorded BETWEEN ${vals.add(
    start_time
  )} AND ${vals.add(end_time)} AND recorded-timestamp <= ${vals.add(SLA)}`
  return makeReadOnlyQuery(query, vals.values())
}

export async function getTrips(
  provider_id: UUID,
  vehicleType: VEHICLE_TYPE,
  start_time: Timestamp = 0,
  end_time: Timestamp = Date.now()
): Promise<TripEntry[]> {
  const vals = new SqlVals()
  const query = `SELECT * FROM reports_trips WHERE provider_id = '${vals.add(
    provider_id
  )}' AND vehicle_type = '${vals.add(vehicleType)}' AND end_time BETWEEN ${vals.add(start_time)} AND ${vals.add(
    end_time
  )}`
  return makeReadOnlyQuery(query, vals.values())
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

interface GetAllMetricsArgs {
  start_time: Timestamp
  end_time: Timestamp
  provider_id: UUID | null
  geography_id: UUID | null
  vehicle_type: VEHICLE_TYPE | null
}

export async function getAllMetrics({
  start_time,
  end_time,
  provider_id,
  geography_id,
  vehicle_type
}: GetAllMetricsArgs): Promise<Array<MetricsTableRow>> {
  const vals = new SqlVals()
  const providerSegment = provider_id !== null ? ` AND provider_id = "${vals.add(provider_id)}" ` : ''
  const geographySegment = geography_id !== null ? ` AND geography_id = "${vals.add(geography_id)}" ` : ''
  const vehicleTypeSegment = vehicle_type !== null ? ` AND vehicle_type = "${vals.add(vehicle_type)}" ` : ''
  const query = `SELECT * FROM reports_providers WHERE start_time BETWEEN ${vals.add(start_time)} AND ${vals.add(
    end_time
  )}${providerSegment}${geographySegment}${vehicleTypeSegment}`
  return makeReadOnlyQuery(query, vals.values())
}
