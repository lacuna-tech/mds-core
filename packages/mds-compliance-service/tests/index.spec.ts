import { createConnection, ConnectionOptions } from 'typeorm'
import { now, days, uuid } from '@mds-core/mds-utils'
import { ComplianceServiceManager } from '../service/manager'
import { ComplianceServiceClient } from '../client'
import { ComplianceSnapshotDomainModel } from '../@types'
import ormconfig = require('../ormconfig')

const TIME = now()
const COMPLIANCE_SNAPSHOT_ID = 'ec3706e4-9cfd-48d7-8330-150fc733e7e0'
const PROVIDER_ID = 'aa777467-be73-4710-9c4c-e0bea5dd3ac8'
const POLICY_ID = 'afc11dfe-3b0c-473b-9874-0c372909df73'
const COMPLIANCE_SNAPSHOT: ComplianceSnapshotDomainModel = {
  policy: {
    name: 'a dummy',
    policy_id: POLICY_ID
  },
  provider_id: PROVIDER_ID,
  compliance_as_of: TIME,
  compliance_snapshot_id: COMPLIANCE_SNAPSHOT_ID,
  vehicles_found: [
    {
      device_id: '170e2ac5-c786-405a-bef7-ae15c89b3e53',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: TIME,
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.18319703595646, lng: -118.45538981769323 }
    },
    {
      device_id: 'e18a7f26-e3eb-4320-b82d-9b7f8af181e2',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: TIME,
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.18541489229653, lng: -118.53515310658483 }
    },
    {
      device_id: 'f99b08a0-79b3-4250-b76f-667b378334fe',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: TIME,
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.22541868137434, lng: -118.40034283985302 }
    }
  ],
  excess_vehicles_count: 3,
  total_violations: 3
}

const COMPLIANCE_SNAPSHOT_1: ComplianceSnapshotDomainModel = {
  policy: {
    name: 'a dummy',
    policy_id: 'afc11dfe-3b0c-473b-9874-0c372909df73'
  },
  provider_id: 'aa777467-be73-4710-9c4c-e0bea5dd3ac8',
  compliance_as_of: now() + days(1),
  compliance_snapshot_id: uuid(),
  vehicles_found: [
    {
      device_id: '170e2ac5-c786-405a-bef7-ae15c89b3e53',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: now() + days(1),
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.18319703595646, lng: -118.45538981769323 }
    }
  ],
  excess_vehicles_count: 1,
  total_violations: 1
}

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
