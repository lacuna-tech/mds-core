import { Audit, AuditEvent, UUID, Recorded } from '@mds-core/mds-types'
import { now } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'

import { ReadAuditsQueryParams } from './types'

import { vals_sql, cols_sql, vals_list, logSql, SqlVals } from './sql-utils'

import { getReadOnlyClient, getWriteableClient } from './client'

export async function readAudit(audit_trip_id: UUID) {
  const client = await getReadOnlyClient()
  const sql = `SELECT * FROM "audits" WHERE deleted IS NULL AND audit_trip_id=$1`
  const values = [audit_trip_id]
  await logSql(sql, values)
  const result = await client.query(sql, values)
  if (result.rows.length === 1) {
    return result.rows[0]
  }
  const error = `readAudit db failed for ${audit_trip_id}: rows=${result.rows.length}`
  logger.warn(error)
  throw new Error(error)
}

export async function readAudits(query: ReadAuditsQueryParams) {
  const client = await getReadOnlyClient()

  const { skip, take, provider_id, provider_vehicle_id, audit_subject_id, start_time, end_time } = query

  const vals = new SqlVals()

  const conditions = [
    `deleted IS NULL`,
    ...(provider_id ? [`provider_id = ${vals.add(provider_id)}`] : []),
    ...(provider_vehicle_id ? [`provider_vehicle_id ILIKE ${vals.add(`%${provider_vehicle_id}%`)}`] : []),
    ...(audit_subject_id ? [`audit_subject_id ILIKE ${vals.add(`%${audit_subject_id}%`)}`] : []),
    ...(start_time ? [`timestamp >= ${vals.add(start_time)}`] : []),
    ...(end_time ? [`timestamp <= ${vals.add(end_time)}`] : [])
  ]

  try {
    const filter = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const countSql = `SELECT COUNT(*) FROM "audits" ${filter}`
    const countVals = vals.values()
    await logSql(countSql, countVals)
    const countResult = await client.query(countSql, countVals)
    const count = parseInt(countResult.rows[0].count)
    if (count === 0) {
      return {
        count,
        audits: []
      }
    }
    const selectSql = `SELECT * FROM "audits" ${filter} ORDER BY "timestamp" DESC${
      typeof skip === 'number' && skip >= 0 ? ` OFFSET ${vals.add(skip)}` : ''
    }${typeof take === 'number' && take >= 0 ? ` LIMIT ${vals.add(take)}` : ''}`
    const selectVals = vals.values()
    await logSql(selectSql, selectVals)
    const selectResult = await client.query(selectSql, selectVals)
    return {
      count,
      audits: selectResult.rows
    }
  } catch (err) {
    logger.error('readAudits error', err.stack || err)
    throw err
  }
}

export async function writeAudit(audit: Audit): Promise<Recorded<Audit>> {
  const columns = [
    'audit_trip_id',
    'audit_device_id',
    'audit_subject_id',
    'provider_id',
    'provider_name',
    'provider_vehicle_id',
    'provider_device_id',
    'timestamp',
    'deleted',
    'recorded'
  ]
  // write pg
  const start = now()
  const client = await getWriteableClient()
  const sql = `INSERT INTO "audits" (${cols_sql(columns)}) VALUES (${vals_sql(columns)}) RETURNING *`
  const values = vals_list(columns, { ...audit, recorded: now() })
  await logSql(sql, values)
  const {
    rows: [recorded_audit]
  }: { rows: Recorded<Audit>[] } = await client.query(sql, values)
  const finish = now()
  logger.info(`MDS-DB writeAudit time elapsed: ${finish - start}ms`)
  return { ...audit, ...recorded_audit }
}

export async function deleteAudit(audit_trip_id: UUID) {
  const client = await getWriteableClient()
  const sql = `UPDATE "audits" SET deleted=$1 WHERE audit_trip_id=$2 AND deleted IS NULL`
  const values = [now(), audit_trip_id]
  await logSql(sql, values)
  const result = await client.query(sql, values)
  return result.rowCount
}

export async function readAuditEvents(audit_trip_id: UUID): Promise<Recorded<AuditEvent>[]> {
  try {
    const client = await getReadOnlyClient()
    const vals = new SqlVals()
    const sql = `SELECT * FROM "audit_events" WHERE audit_trip_id=${vals.add(audit_trip_id)} ORDER BY "timestamp"`
    const sqlVals = vals.values()
    await logSql(sql, sqlVals)
    const result = await client.query(sql, sqlVals)
    return result.rows
  } catch (err) {
    logger.error('readAuditEvents error', err.stack || err)
    throw err
  }
}

export async function writeAuditEvent(audit_event: AuditEvent): Promise<Recorded<AuditEvent>> {
  const columns = [
    'audit_trip_id',
    'audit_event_id',
    'audit_event_type',
    'audit_issue_code',
    'audit_subject_id',
    'note',
    'timestamp',
    'lat',
    'lng',
    'speed',
    'heading',
    'accuracy',
    'altitude',
    'charge',
    'recorded'
  ]
  const start = now()
  const client = await getWriteableClient()
  const sql = `INSERT INTO "audit_events" (${cols_sql(columns)}) VALUES (${vals_sql(columns)}) RETURNING *`
  const values = vals_list(columns, { ...audit_event, recorded: now() })
  await logSql(sql, values)
  const {
    rows: [recorded_audit_event]
  }: { rows: Recorded<AuditEvent>[] } = await client.query(sql, values)
  const finish = now()
  logger.info(`MDS-DB writeAuditEvent time elapsed: ${finish - start}ms`)
  return { ...audit_event, ...recorded_audit_event }
}
