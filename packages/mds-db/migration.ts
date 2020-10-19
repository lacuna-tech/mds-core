import { csv } from '@mds-core/mds-utils'

import logger from '@mds-core/mds-logger'
import schema, { COLUMN_NAME, TABLE_NAME } from './schema'
import { SqlExecuter, MDSPostgresClient } from './sql-utils'

// drop tables from a list of table names
async function dropTables(client: MDSPostgresClient) {
  const exec = SqlExecuter(client)
  const drop = csv(schema.DEPRECATED_PROVIDER_TABLES.concat(schema.TABLES))
  await exec(`DROP TABLE IF EXISTS ${drop};`)
  logger.info(`postgres drop table succeeded: ${drop}`)
}

// Add a foreign key if it doesn't already exist
async function addForeignKey(client: MDSPostgresClient, from: TABLE_NAME, to: TABLE_NAME, column: COLUMN_NAME) {
  const exec = SqlExecuter(client)
  const foreignKeyName = `fk_${to}_${column}`
  const sql = `DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${foreignKeyName}') THEN
        ALTER TABLE ${from}
        ADD CONSTRAINT ${foreignKeyName}
        FOREIGN KEY (${column}) REFERENCES ${to} (${column});
      END IF;
    END;
    $$`
  await exec(sql)
}

// Add an index if it doesn't already exist
async function addIndex(
  client: MDSPostgresClient,
  table: TABLE_NAME,
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

  const missing = schema.TABLES.filter(
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
    await addForeignKey(client, schema.TABLE.policy_metadata, schema.TABLE.policies, schema.COLUMN.policy_id)
    await addForeignKey(client, schema.TABLE.geography_metadata, schema.TABLE.geographies, schema.COLUMN.geography_id)
  }
}

export { dropTables, createTables }
