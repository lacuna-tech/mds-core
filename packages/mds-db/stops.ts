import { Recorded, Stop, UUID } from '@mds-core/mds-types'
import { now } from '@mds-core/mds-utils'

import schema from './schema'

import { vals_sql, cols_sql, vals_list, logSql } from './sql-utils'

import { getWriteableClient } from './client'
import { getReadOnlyClient } from './dist/client'

export async function writeStop(stop: Stop): Promise<Recorded<Stop>> {
  const client = await getWriteableClient()
  const sql = `INSERT INTO ${schema.TABLE.stops} (${cols_sql(schema.TABLE_COLUMNS.stops)}) VALUES (${vals_sql(
    schema.TABLE_COLUMNS.stops
  )}) RETURNING *`
  const values = vals_list(schema.TABLE_COLUMNS.stops, { ...stop, recorded: now() })
  await logSql(sql, values)
  const {
    rows: [recorded_stop]
  }: { rows: Recorded<Stop>[] } = await client.query(sql, values)
  return { ...stop, ...recorded_stop }
}

export async function readStop(stop_id: UUID): Promise<Recorded<Stop>> {
  const client = await getReadOnlyClient()
  const sql = `SELECT * FROM ${schema.TABLE.stops} WHERE stop_id IS ${stop_id}`
  const {
    rows: [recorded_stop]
  }: { rows: Recorded<Stop>[] } = await client.query(sql)
  return recorded_stop
}

export async function readStops(): Promise<Recorded<Stop>[]> {
  const client = await getReadOnlyClient()
  const sql = `SELECT * FROM ${schema.TABLE.stops}`
  const { rows } = await client.query(sql)

  return rows
}
