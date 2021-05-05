import { schemas as transactionServiceSchemas } from '@mds-core/mds-transaction-service'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { TransactionApiVersionSchema } from './middleware'

const SCHEMA_DIR = 'schema-gen'

const README = `# Schema-Gen

The files in this folder are 100% auto-generated and **should not be manually modified**.

## Usage

To add/remove schemas from this folder, please modify the contents of this package's [generate-schemas.ts](../generate-schemas.ts) to change what's generated.
`

if (!existsSync(SCHEMA_DIR)) {
  mkdirSync(SCHEMA_DIR)
  writeFileSync(`${SCHEMA_DIR}/README.md`, README)
}

const schemas = [...transactionServiceSchemas, TransactionApiVersionSchema]

schemas.map(({ $id, $schema, ...schema }) =>
  writeFileSync(`${SCHEMA_DIR}/${$id}Schema.json`, JSON.stringify(schema, null, 2))
)
