import { createConnection, ConnectionOptions } from 'typeorm'
import { now, days } from '@mds-core/mds-utils'
import { ComplianceServiceManager } from '../service/manager'
import { ComplianceServiceClient } from '../client'
import {
  COMPLIANCE_SNAPSHOT,
  COMPLIANCE_SNAPSHOTS,
  COMPLIANCE_SNAPSHOTS_PROVIDER_2_POLICY_2,
  COMPLIANCE_SNAPSHOT_1,
  COMPLIANCE_SNAPSHOT_ID,
  POLICY_ID,
  POLICY_ID_1,
  POLICY_ID_2,
  PROVIDER_ID,
  PROVIDER_ID_1,
  PROVIDER_ID_2,
  TIME
} from './fixtures'
import { ComplianceAggregateDomainModel } from '../@types'
import { ComplianceRepository } from '../repository'
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
      start_time: TIME - days(1)
    })

    expect(complianceSnapshots.length).toEqual(1)
    const [complianceSnapshot] = complianceSnapshots
    expect(complianceSnapshot.compliance_snapshot_id).toEqual(COMPLIANCE_SNAPSHOT_ID)
  })

  it('Gets ComplianceSnapshots By TimeInterval (start_time, end_time options)', async () => {
    const complianceSnapshots = await ComplianceServiceClient.getComplianceSnapshotsByTimeInterval({
      start_time: TIME - days(2),
      end_time: TIME - days(1)
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
      provider_ids: [PROVIDER_ID]
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

  it.only('Accurately breaks compliance snapshots into violation periods for one provider and policy', async () => {
    await ComplianceServiceClient.createComplianceSnapshots(COMPLIANCE_SNAPSHOTS)
    //    /*
    const results: ComplianceAggregateDomainModel[] = await ComplianceServiceClient.getComplianceViolationPeriods({
      start_time: TIME,
      end_time: undefined,
      provider_ids: [PROVIDER_ID_2],
      policy_ids: [POLICY_ID_2]
    })
    console.log('rezz', JSON.stringify(results))
    expect(results).toEqual([
      {
        provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3',
        provider_name: 'Lime',
        policy_id: 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387',
        violation_periods: [
          {
            start_time: 1605821758035,
            end_time: 1605821758037,
            compliance_snapshot_ids: ['ba636406-1898-49a0-b937-6f825b789ee0', '8cb4d0a8-5edc-46f6-a4e4-a40f5a5f4558']
          },
          {
            start_time: 1605821758038,
            end_time: null,
            compliance_snapshot_ids: ['3a11150b-5d64-4638-bd2d-745905ed8294']
          }
        ]
      }
    ])
  })

  it('Accurately breaks compliance snapshots into violation periods for multiple providers and policies', async () => {
    const results = await ComplianceRepository.getComplianceViolationPeriods({
      start_time: TIME,
      end_time: undefined,
      provider_ids: [PROVIDER_ID_1, PROVIDER_ID_2],
      policy_ids: [POLICY_ID_1, POLICY_ID_2]
    })
    console.log('rezz2', JSON.stringify(results))
    expect(results).toEqual([
      {
        provider_id: 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0',
        policy_id: '6d7a9c7e-853c-4ff7-a86f-e17c06d3bd80',
        provider_name: 'JUMP',
        violation_periods: [
          {
            start_time: 1605821758034,
            end_time: null,
            compliance_snapshot_ids: ['243e1209-61ad-4d7c-8464-db551f1f8c21']
          }
        ]
      },
      {
        provider_id: 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0',
        policy_id: 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387',
        provider_name: 'JUMP',
        violation_periods: []
      },
      {
        provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3',
        policy_id: 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387',
        provider_name: 'Lime',
        violation_periods: [
          {
            start_time: 1605821758035,
            end_time: 1605821758037,
            compliance_snapshot_ids: ['ba636406-1898-49a0-b937-6f825b789ee0', '8cb4d0a8-5edc-46f6-a4e4-a40f5a5f4558']
          },
          {
            start_time: 1605821758038,
            end_time: null,
            compliance_snapshot_ids: ['3a11150b-5d64-4638-bd2d-745905ed8294']
          }
        ]
      },
      {
        provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3',
        policy_id: '6d7a9c7e-853c-4ff7-a86f-e17c06d3bd80',
        provider_name: 'Lime',
        violation_periods: [
          {
            start_time: 1605821758036,
            end_time: null,
            compliance_snapshot_ids: ['39e2171b-a9df-417c-b218-2a82b491a0cc']
          }
        ]
      }
    ])
  })

  afterAll(async () => {
    await complianceServer.stop()
  })
})
