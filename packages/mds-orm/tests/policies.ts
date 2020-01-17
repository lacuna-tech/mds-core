import test from 'unit.js'
import uuid from 'uuid'
import { POLICY_JSON } from '@mds-core/mds-test-data'
import { ConnectionManager } from '../connection'
import { PolicyEntity } from '../entities/policy-entity'

const manager = ConnectionManager(PolicyEntity)

export default () =>
  describe('Write/Read Policies', () => {
    it('writes a Policy', async () => {
      const connection = await manager.getConnection('rw')
      try {
        const repository = connection.getRepository(PolicyEntity)
        await repository
          .createQueryBuilder()
          .insert()
          .values([{ policy_id: POLICY_JSON.policy_id, policy_json: POLICY_JSON }])
          .onConflict('DO NOTHING')
          .execute()
        test.value(policies.length).is(1)
      } finally {
        await connection.close()
      }
    })

    /*
    it(records > 1 ? `Read ${records} Audits(s)` : 'Read Audit', async () => {
      const connection = await manager.getConnection('ro')
      try {
        const audits = await connection.manager.find(AuditEntity, { where: { audit_device_id }, order: { id: 'ASC' } })
        test.value(audits.length).is(records)
      } finally {
        await connection.close()
      }
    })
    */
  })
