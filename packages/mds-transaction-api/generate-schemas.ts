import { schemas } from '@mds-core/mds-transaction-service'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

const SCHEMA_DIR = 'schema-gen'

if (!existsSync(SCHEMA_DIR)) mkdirSync(SCHEMA_DIR)

schemas.map(({ name, schema }) => writeFileSync(`${SCHEMA_DIR}/${name}.json`, JSON.stringify(schema, null, 2)))
