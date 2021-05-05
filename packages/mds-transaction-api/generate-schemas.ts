import { schemas as transactionServiceSchemas } from '@mds-core/mds-transaction-service'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { TransactionApiVersionSchema } from './middleware'

const SCHEMA_DIR = 'schema-gen'

if (!existsSync(SCHEMA_DIR)) mkdirSync(SCHEMA_DIR)

const schemas = [...transactionServiceSchemas, TransactionApiVersionSchema]

schemas.map(({ $id, $schema, ...schema }) =>
  writeFileSync(`${SCHEMA_DIR}/${$id}Schema.json`, JSON.stringify(schema, null, 2))
)
