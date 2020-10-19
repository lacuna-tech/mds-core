import { GeographyServiceManager } from '../service/manager'
import { IngestServiceClient } from '../client'
import { IngestRepository } from '../repository'

describe('Test Migrations', () => {
  it('Run Migrations', async () => {
    await IngestRepository.runAllMigrations()
  })

  it('Revert Migrations', async () => {
    await IngestRepository.revertAllMigrations()
  })
})

const GeographyServer = GeographyServiceManager.controller()

describe('Geography Service Tests', () => {
  beforeAll(async () => {
    await GeographyServer.start()
  })

  it('Test Name Method', async () => {
    const name = await IngestServiceClient.name()
    expect(name).toEqual('mds-ingest-service')
  })

  afterAll(async () => {
    await GeographyServer.stop()
  })
})
