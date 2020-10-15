import { createConnection, ConnectionOptions } from 'typeorm'
import { GeographyServiceManager } from '../service/manager'
import { GeographyServiceClient } from '../client'
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

const GeographyServer = GeographyServiceManager.controller()

describe('Geographies Service Tests', () => {
  beforeAll(async () => {
    await GeographyServer.start()
  })

  it('Test Name Method', async () => {
    const name = await GeographyServiceClient.name()
    expect(name).toEqual('mds-geography-service')
  })

  afterAll(async () => {
    await GeographyServer.stop()
  })
})
