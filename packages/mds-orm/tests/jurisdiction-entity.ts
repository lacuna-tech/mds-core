import test from 'unit.js'
import uuid from 'uuid'
import { ConnectionManager } from '../connection'
import { JurisdictionEntity } from '../entities/jurisdiction-entity'

const records = 5_000
const recorded = Date.now()

const manager = ConnectionManager(JurisdictionEntity)

describe('Write/Read Jurisdictions', () => {
  it(records > 1 ? `Write ${records} Jurisdiction(s)` : 'Write Jurisdiction', async () => {
    const connection = await manager.getReadWriteConnection()
    const jurisdictions = Array.from({ length: records }, (_, index) => ({
      jurisdiction_id: uuid(),
      agency_key: `agency-${index}`,
      agency_name: `Agency ${index}`,
      recorded
    }))
    try {
      const repository = connection.getRepository(JurisdictionEntity)
      const { raw: returning } = await repository
        .createQueryBuilder()
        .insert()
        .values(jurisdictions)
        .returning('*')
        .onConflict('DO NOTHING')
        .execute()
      for (const jurisdiction of returning) {
        test.value(jurisdiction.id).isNot(undefined)
      }
    } finally {
      await connection.close()
    }
  })

  it(records > 1 ? `Read ${records} Jurisdiction(s)` : 'Read Jurisdiction', async () => {
    const connection = await manager.getReadOnlyConnection()
    try {
      const jurisdictions = await connection.manager.find(JurisdictionEntity, { order: { id: 'ASC' } })
      test.value(jurisdictions.length).is(records)
    } finally {
      await connection.close()
    }
  })
})
