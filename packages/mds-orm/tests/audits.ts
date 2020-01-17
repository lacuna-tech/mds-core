import test from 'unit.js'
import uuid from 'uuid'
import { MOCHA_PROVIDER_ID } from '@mds-core/mds-providers'
import { ConnectionManager } from '../connection'
import { AuditEntity } from '../entities/audit-entity'

const records = 5_000
const recorded = Date.now()
const audit_device_id = uuid()

const manager = ConnectionManager(PolicyEntity)

export default () =>
  describe('Write/Read Audits', () => {
    it(records > 1 ? `Write ${records} Audits(s)` : 'Write Audit', async () => {
      const connection = await manager.getConnection('rw')
      try {
        const repository = connection.getRepository(PolicyEntity)
        await repository
          .createQueryBuilder()
          .insert()
          .values(audits)
          .onConflict('DO NOTHING')
          .execute()
        test.value(audits.length).is(records)
      } finally {
        await connection.close()
      }
    })

    it(records > 1 ? `Read ${records} Audits(s)` : 'Read Audit', async () => {
      const connection = await manager.getConnection('ro')
      try {
        const audits = await connection.manager.find(AuditEntity, { where: { audit_device_id }, order: { id: 'ASC' } })
        test.value(audits.length).is(records)
      } finally {
        await connection.close()
      }
    })
  })
