import { createConnection, ConnectionOptions } from 'typeorm'
import { ComplianceSnapshotServiceManager } from '../service/manager'
import { ComplianceSnapshotServiceClient } from '../client'
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

const ComplianceSnapshotServer = ComplianceSnapshotServiceManager.controller()

describe('ComplianceSnapshots Service Tests', () => {
  beforeAll(async () => {
    await ComplianceSnapshotServer.start()
  })

  it('Post ComplianceSnapshot', async () => {
    const complianceSnapshot = await ComplianceSnapshotServiceClient.createComplianceSnapshot({
      policy: {
        name: 'a dummy',
        policy_id: 'afc11dfe-3b0c-473b-9874-0c372909df73'
      },
      provider_id: 'aa777467-be73-4710-9c4c-e0bea5dd3ac8',
      compliance_as_of: 1603831850,
      compliance_snapshot_id: 'ec3706e4-9cfd-48d7-8330-150fc733e7e0',
      vehicles_found: [
        {
          device_id: '170e2ac5-c786-405a-bef7-ae15c89b3e53',
          state: 'on_trip',
          event_types: ['trip_start'],
          timestamp: 1603830697190,
          rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
          rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
          speed: undefined,
          gps: { lat: 34.18319703595646, lng: -118.45538981769323 }
        },
        {
          device_id: 'e18a7f26-e3eb-4320-b82d-9b7f8af181e2',
          state: 'on_trip',
          event_types: ['trip_start'],
          timestamp: 1603830697190,
          rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
          rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
          speed: undefined,
          gps: { lat: 34.18541489229653, lng: -118.53515310658483 }
        },
        {
          device_id: 'f99b08a0-79b3-4250-b76f-667b378334fe',
          state: 'on_trip',
          event_types: ['trip_start'],
          timestamp: 1603830697190,
          rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
          rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
          speed: undefined,
          gps: { lat: 34.22541868137434, lng: -118.40034283985302 }
        }
      ],
      excess_vehicles_count: 3,
      total_violations: 3
    })
    expect(complianceSnapshot.compliance_snapshot_id).toEqual('ec3706e4-9cfd-48d7-8330-150fc733e7e0')
    expect(complianceSnapshot.vehicles_found.length).toEqual(3)
  })

  it('Get All ComplianceSnapshots', async () => {
    const complianceSnapshots = await ComplianceSnapshotServiceClient.getComplianceSnapshots()
    expect(complianceSnapshots.length).toEqual(1)
    const [complianceSnapshot] = complianceSnapshots
    expect(complianceSnapshot.compliance_snapshot_id).toEqual('ec3706e4-9cfd-48d7-8330-150fc733e7e0')
  })

  /*
  it('Get One ComplianceSnapshot', async () => {
    const ComplianceSnapshot = await ComplianceSnapshotServiceClient.getComplianceSnapshot('Test ComplianceSnapshot')
    expect(ComplianceSnapshot.name).toEqual('Test ComplianceSnapshot')
  })
  */

  afterAll(async () => {
    await ComplianceSnapshotServer.stop()
  })
})
