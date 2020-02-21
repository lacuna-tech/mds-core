import { Connections } from '@mds-core/mds-orm/connections'
import * as entities from './entities'
import * as migrations from './migrations'

const connections = Connections({
  entities: Object.values(entities),
  migrations: Object.values(migrations)
})

// Make connections array available for TypeScript import
export default connections

// Make connections array available to TypeORM CLI
module.exports = connections
