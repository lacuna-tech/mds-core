import { csv } from '@mds-core/mds-utils'

import logger from '@mds-core/mds-logger'
import { GeographyRepository } from '@mds-core/mds-geography-service'
import { PolicyRepository } from '@mds-core/mds-policy-service'
import schema, { COLUMN_NAME, MANAGED_TABLE_NAME } from './schema'
import { SqlExecuter, MDSPostgresClient } from './sql-utils'

// drop tables from a list of table names
async function dropTables(client: MDSPostgresClient) {
  const exec = SqlExecuter(client)
  const drop = csv(schema.DEPRECATED_TABLES.concat(schema.MANAGED_TABLES))
  await exec(`DROP TABLE IF EXISTS ${drop};`)
  await Promise.all([GeographyRepository.revertAllMigrations(), PolicyRepository.revertAllMigrations()])
  logger.info(`postgres drop table succeeded: ${drop}`)
}

// Add an index if it doesn't already exist
async function addIndex(
  client: MDSPostgresClient,
  table: MANAGED_TABLE_NAME,
  column: COLUMN_NAME,
  options: Partial<{ unique: boolean }> = { unique: false }
) {
  const exec = SqlExecuter(client)
  const indexName = `idx_${column}_${table}`

  const {
    rows: { length: hasColumn }
  } = await exec(
    `SELECT column_name FROM information_schema.columns WHERE table_name='${table}' AND column_name='${column}' AND table_catalog=CURRENT_CATALOG AND table_schema=CURRENT_SCHEMA`
  )

  if (hasColumn) {
    const {
      rows: { length: hasIndex }
    } = await exec(`SELECT tablename FROM pg_indexes WHERE tablename='${table}' AND indexname='${indexName}'`)

    if (!hasIndex) {
      await exec(`CREATE${options.unique ? ' UNIQUE ' : ' '}INDEX ${indexName} ON ${table}(${column})`)
    }
  }
}

/**
 * create tables from a list of table names
 */
async function createTables(client: MDSPostgresClient) {
  const exec = SqlExecuter(client)
  /* eslint-reason ambiguous DB function */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const existing: { rows: { table_name: string }[] } = await exec(
    'SELECT table_name FROM information_schema.tables WHERE table_catalog = CURRENT_CATALOG AND table_schema = CURRENT_SCHEMA'
  )

  const missing = schema.MANAGED_TABLES.filter(
    /* eslint-reason ambiguous DB function */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (table: string) => !existing.rows.find((row: any) => row.table_name === table)
  )
  if (missing.length > 0) {
    logger.warn('existing', JSON.stringify(existing.rows), 'missing', JSON.stringify(missing))
    const create = missing
      .map(
        table =>
          `CREATE TABLE ${table} (${schema.TABLE_COLUMNS[table]
            .map(column => `${column} ${schema.COLUMN_TYPE[column]}`)
            .join(', ')}, PRIMARY KEY (${csv(schema.TABLE_KEY[table])}));`
      )
      .join('\n')
    logger.warn(create)
    await exec(create)
    logger.info('postgres create table suceeded')
    await Promise.all(missing.map(table => addIndex(client, table, schema.COLUMN.recorded)))
    await Promise.all(missing.map(table => addIndex(client, table, schema.COLUMN.id, { unique: true })))
  }
  await Promise.all([GeographyRepository.runAllMigrations(), PolicyRepository.runAllMigrations()])
}

export { dropTables, createTables }
