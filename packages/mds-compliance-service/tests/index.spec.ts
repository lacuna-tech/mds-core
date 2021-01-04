import { createConnection, ConnectionOptions } from 'typeorm'
import { now, days } from '@mds-core/mds-utils'
import { ComplianceServiceManager } from '../service/manager'
import { ComplianceServiceClient } from '../client'
import {
  COMPLIANCE_SNAPSHOT,
  COMPLIANCE_SNAPSHOT_1,
  COMPLIANCE_SNAPSHOT_ID,
  POLICY_ID,
  PROVIDER_ID,
  TIME
} from './fixtures'
import ormconfig = require('../ormconfig')

describe('Test Migrations', () => {
  it('Run Migrations', async () => {
    const connection = await createConnection(ormconfig as ConnectionOptions)
    await connection.runMigrations()
    await connection.close()
  })

  it('Revert Migrations', async () => {
    const connection = await createConnection(ormconfig as ConnectionOptions)
    await connection.migrations.reduce(p => p.then(() => connection.undoLastMigration()), Promise.resolve())
    await connection.close()
  })
})

const complianceServer = ComplianceServiceManager.controller()

describe('ComplianceSnapshots Service Tests', () => {
  beforeAll(async () => {
    await complianceServer.start()
  })

  it('Post ComplianceSnapshot', async () => {
    const complianceSnapshot = await ComplianceServiceClient.createComplianceSnapshot(COMPLIANCE_SNAPSHOT)
    expect(complianceSnapshot.compliance_snapshot_id).toEqual(COMPLIANCE_SNAPSHOT_ID)
    expect(complianceSnapshot.vehicles_found.length).toEqual(3)
  })

  it('Gets ComplianceSnapshots By TimeInterval (start_time, no end_time options)', async () => {
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time: now() - days(1)
    })
    expect(complianceSnapshots.length).toEqual(1)
    const [complianceSnapshot] = complianceSnapshots
    expect(complianceSnapshot.compliance_snapshot_id).toEqual(COMPLIANCE_SNAPSHOT_ID)
  })

  it('Gets ComplianceSnapshots By TimeInterval (start_time, end_time options)', async () => {
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time: now() - days(2),
      end_time: now() - days(1)
    })
    expect(complianceSnapshots.length).toEqual(0)
  })

  it('Throws When Getting ComplianceSnapshots By TimeInterval and end_time < start_time (start_time, end_time options)', async () => {
    try {
      await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
        start_time: now() - days(2),
        end_time: now() - days(3)
      })
    } catch (error) {
      expect(error.details).toMatch('start_time not provided')
    }
  })

  it('Gets ComplianceSnapshots By TimeInterval (start_time, provider_ids options)', async () => {
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time: now() - days(2),
      provider_ids: ['aa777467-be73-4710-9c4c-e0bea5dd3ac8']
    })
    expect(complianceSnapshots.length).toEqual(1)
  })

  it('Gets ComplianceSnapshots By TimeInterval (start_time, policy_ids options)', async () => {
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time: now() - days(2),
      policy_ids: ['afc11dfe-3b0c-473b-9874-0c372909df73']
    })
    expect(complianceSnapshots.length).toEqual(1)
  })

  it('Gets ComplianceSnapshots By IDs', async () => {
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByIDs([COMPLIANCE_SNAPSHOT_ID])
    expect(complianceSnapshots.length).toEqual(1)
  })

  it('Get One ComplianceSnapshot by ID', async () => {
    const complianceSnapshot = await ComplianceServiceClient.getComplianceSnapshot({
      compliance_snapshot_id: COMPLIANCE_SNAPSHOT_ID
    })
    expect(complianceSnapshot.compliance_snapshot_id).toEqual(COMPLIANCE_SNAPSHOT_ID)
    expect(complianceSnapshot.policy.name).toEqual('a dummy')
    expect(complianceSnapshot.vehicles_found.length).toEqual(3)
  })

  it('Get One ComplianceSnapshot by provider_id, policy_id', async () => {
    await ComplianceServiceClient.createComplianceSnapshot(COMPLIANCE_SNAPSHOT_1)
    const complianceSnapshot = await ComplianceServiceClient.getComplianceSnapshot({
      provider_id: PROVIDER_ID,
      policy_id: POLICY_ID,
      compliance_as_of: TIME - 10
    })
    expect(complianceSnapshot.compliance_snapshot_id).toEqual(COMPLIANCE_SNAPSHOT_ID)
    expect(complianceSnapshot.policy.name).toEqual('a dummy')
    expect(complianceSnapshot.vehicles_found.length).toEqual(3)

    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByIDs([
      COMPLIANCE_SNAPSHOT_ID,
      COMPLIANCE_SNAPSHOT_1.compliance_snapshot_id
    ])
    expect(complianceSnapshots.length).toEqual(2)
  })

  afterAll(async () => {
    await complianceServer.stop()
  })
})
