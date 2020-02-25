import { Geography, GeographySummary, UUID, Recorded, GeographyMetadata } from '@mds-core/mds-types'
import { NotFoundError, DependencyMissingError, AlreadyPublishedError } from '@mds-core/mds-utils'
import log from '@mds-core/mds-logger'

import schema from './schema'

import { vals_sql, cols_sql, vals_list, SqlVals } from './sql-utils'

import { getReadOnlyClient, getWriteableClient } from './client'
import { ReadGeographiesParams, PublishGeographiesParams } from './types'

export async function readSingleGeography(geography_id: UUID): Promise<Geography> {
  const client = await getReadOnlyClient()

  const sql = `select * from ${schema.TABLE.geographies} where geography_id = '${geography_id}'`
  const { rows } = await client.query(sql)

  if (rows.length === 0) {
    await log.info(`readSingleGeography failed for ${geography_id}`)
    throw new NotFoundError(`geography of id ${geography_id} not found`)
  }

  const { id, ...geography } = rows[0]
  return geography
}

export async function readGeographies(params: Partial<ReadGeographiesParams> = {}): Promise<Geography[]> {
  try {
    const client = await getReadOnlyClient()

    const { get_read_only } = { get_read_only: false, ...params }

    let sql = `SELECT * FROM ${schema.TABLE.geographies}`

    const conditions = []
    const vals = new SqlVals()

    if (get_read_only) {
      conditions.push(`publish_date IS NOT NULL`)
    }

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    const values = vals.values()
    // TODO insufficiently general
    // TODO add 'count'
    const { rows } = await client.query(sql, values)

    return rows.map(row => {
      const { id, ...geography } = row
      return geography
    })
  } catch (err) {
    await log.error('readGeographies', err)
    throw err
  }
}

export async function readGeographySummaries(params?: { get_read_only?: boolean }): Promise<GeographySummary[]> {
  const geographies = await readGeographies(params)
  return geographies.map(geography => {
    const { geography_json, ...geographySummary } = geography
    return geographySummary
  })
}

export async function readBulkGeographyMetadata(params?: { get_read_only?: boolean }): Promise<GeographyMetadata[]> {
  const geographies = await readGeographies(params)
  const geography_ids = geographies.map(geography => {
    return `'${geography.geography_id}'`
  })

  if (geography_ids.length === 0) {
    return []
  }
  const sql = `select * from ${schema.TABLE.geography_metadata} where geography_id in (${geography_ids.join(',')})`

  const client = await getReadOnlyClient()
  const res = await client.query(sql)
  return res.rows.map(row => {
    return { geography_id: row.geography_id, geography_metadata: row.geography_metadata }
  })
}

export async function writeGeography(geography: Geography): Promise<Recorded<Geography>> {
  // validate TODO
  // write
  const client = await getWriteableClient()
  const sql = `INSERT INTO ${schema.TABLE.geographies} (${cols_sql(
    schema.TABLE_COLUMNS.geographies
  )}) VALUES (${vals_sql(schema.TABLE_COLUMNS.geographies)}) RETURNING *`
  const values = vals_list(schema.TABLE_COLUMNS.geographies, { ...geography })
  const {
    rows: [recorded_geography]
  }: { rows: Recorded<Geography>[] } = await client.query(sql, values)
  return { ...geography, ...recorded_geography }
}

export async function isGeographyPublished(geography_id: UUID) {
  const client = await getReadOnlyClient()
  const sql = `SELECT * FROM ${schema.TABLE.geographies} WHERE geography_id='${geography_id}'`
  const result = await client.query(sql).catch(err => {
    throw err
  })
  if (result.rows.length === 0) {
    throw new NotFoundError(`geography_id ${geography_id} not found`)
  }
  log.info('is geography published', geography_id, Boolean(result.rows[0].publish_date))
  return Boolean(result.rows[0].publish_date)
}

export async function editGeography(geography: Geography): Promise<Geography> {
  // validate TODO
  if (await isGeographyPublished(geography.geography_id)) {
    throw new Error('Cannot edit published Geography')
  }

  const client = await getWriteableClient()
  const vals = new SqlVals()
  const conditions: string[] = []
  Object.entries(geography).forEach(([key, value]) => {
    if (key === 'geography_json') {
      conditions.push(`geography_json = ${vals.add(JSON.stringify(geography.geography_json))}`)
    } else {
      conditions.push(`${key} = ${vals.add(value)}`)
    }
  })
  const sql = `UPDATE ${schema.TABLE.geographies} SET ${conditions} WHERE geography_id='${geography.geography_id}' AND publish_date IS NULL`

  await client.query(sql, vals.values())
  const res = await readSingleGeography(geography.geography_id)
  return res
}

export async function deleteGeography(geography_id: UUID) {
  if (await isGeographyPublished(geography_id)) {
    throw new AlreadyPublishedError('Cannot edit published Geography')
  }

  const client = await getWriteableClient()
  const sql = `DELETE FROM ${schema.TABLE.geographies} WHERE geography_id=$1 AND publish_date IS NULL`
  await client.query(sql, [geography_id])
  return geography_id
}

export async function publishGeography(params: PublishGeographiesParams): Promise<Geography> {
  /* publish_date is a param instead of a default, because when a Policy is published,
   * we want to be able to set the publish_date of any associated Geography to be
   * identical to the publish_date of the Policy.
   */
  const { geography_id, publish_date = Date.now() } = params
  try {
    const client = await getWriteableClient()

    const geography = await readSingleGeography(geography_id)
    if (!geography) {
      throw new NotFoundError('cannot publish nonexistent geography')
    }

    const vals = new SqlVals()
    const conditions = []
    conditions.push(`publish_date = ${vals.add(publish_date)}`)
    const sql = `UPDATE ${schema.TABLE.geographies} SET ${conditions} where geography_id=${vals.add(geography_id)}`
    await client.query(sql, vals.values())

    const res = await readSingleGeography(geography_id)
    return res
  } catch (err) {
    await log.error(err)
    throw err
  }
}

export async function writeGeographyMetadata(geography_metadata: GeographyMetadata): Promise<GeographyMetadata> {
  try {
    await readSingleGeography(geography_metadata.geography_id)
    const client = await getWriteableClient()
    const sql = `INSERT INTO ${schema.TABLE.geography_metadata} (${cols_sql(
      schema.TABLE_COLUMNS.geography_metadata
    )}) VALUES (${vals_sql(schema.TABLE_COLUMNS.geography_metadata)}) RETURNING *`
    const values = vals_list(schema.TABLE_COLUMNS.geography_metadata, {
      geography_id: geography_metadata.geography_id,
      geography_metadata: geography_metadata.geography_metadata
    })
    const {
      rows: [recorded_metadata]
    }: { rows: Recorded<Geography>[] } = await client.query(sql, values)
    return { ...geography_metadata, ...recorded_metadata }
  } catch (err) {
    throw new DependencyMissingError(
      `metadata not written, because no geography exists for geography_id ${geography_metadata.geography_id}`
    )
  }
}

export async function readSingleGeographyMetadata(geography_id: UUID): Promise<GeographyMetadata> {
  const client = await getReadOnlyClient()
  const sql = `SELECT * FROM ${schema.TABLE.geography_metadata} WHERE geography_id = '${geography_id}'`
  const result = await client.query(sql)
  if (result.rows.length === 0) {
    throw new NotFoundError(`Metadata for ${geography_id} not found`)
  }
  return { geography_id, geography_metadata: result.rows[0].geography_metadata }
}

export async function updateGeographyMetadata(geography_metadata: GeographyMetadata): Promise<GeographyMetadata> {
  await readSingleGeographyMetadata(geography_metadata.geography_id)
  const client = await getWriteableClient()
  const sql = `UPDATE ${schema.TABLE.geography_metadata}
    SET geography_metadata = '${JSON.stringify(geography_metadata.geography_metadata)}'
    WHERE geography_id = '${geography_metadata.geography_id}'`
  const {
    rows: [recorded_metadata]
  }: { rows: Recorded<GeographyMetadata>[] } = await client.query(sql)
  return {
    ...geography_metadata,
    ...recorded_metadata
  }
}
