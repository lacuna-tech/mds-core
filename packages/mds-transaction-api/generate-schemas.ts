import { schemas } from '@mds-core/mds-transaction-service'
import { writeFileSync } from 'fs'

schemas.map(({ name, schema }) => writeFileSync(`schema-gen/${name}.json`, JSON.stringify(schema, null, 2)))
