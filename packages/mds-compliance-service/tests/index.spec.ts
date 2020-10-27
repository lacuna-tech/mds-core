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
    const ComplianceSnapshot = await ComplianceSnapshotServiceClient.createComplianceSnapshot({
      name: 'Test ComplianceSnapshot',
      text: 'This is a test'
    })
    expect(ComplianceSnapshot.name).toEqual('Test ComplianceSnapshot')
  })

  it('Get All ComplianceSnapshots', async () => {
    const ComplianceSnapshots = await ComplianceSnapshotServiceClient.getComplianceSnapshots()
    expect(ComplianceSnapshots.length).toEqual(1)
    const [ComplianceSnapshot] = ComplianceSnapshots
    expect(ComplianceSnapshot.name).toEqual('Test ComplianceSnapshot')
  })

  it('Get One ComplianceSnapshot', async () => {
    const ComplianceSnapshot = await ComplianceSnapshotServiceClient.getComplianceSnapshot('Test ComplianceSnapshot')
    expect(ComplianceSnapshot.name).toEqual('Test ComplianceSnapshot')
  })

  afterAll(async () => {
    await ComplianceSnapshotServer.stop()
  })
})
