import { uuid, now } from '@mds-core/mds-utils'
import { GeographyServiceManager } from '../service/manager'
import { GeographyServiceClient } from '../client'
import { GeographyRepository } from '../repository'

const geography_id = uuid()

describe('Geography Repository Tests', () => {
  beforeAll(async () => {
    await GeographyRepository.initialize()
  })

  it('Run Migrations', async () => {
    await GeographyRepository.runAllMigrations()
  })

  it('Revert Migrations', async () => {
    await GeographyRepository.revertAllMigrations()
  })

  afterAll(async () => {
    await GeographyRepository.shutdown()
  })
})

const GeographyServer = GeographyServiceManager.controller()

describe('Geography Service Tests', () => {
  beforeAll(async () => {
    await GeographyServer.start()
  })

  it('Test Write Geographies', async () => {
    const geographies = await GeographyServiceClient.writeGeographies([
      {
        geography_id,
        publish_date: now(),
        geography_json: { type: 'FeatureCollection', features: [] }
      },
      { geography_id: uuid(), geography_json: { type: 'FeatureCollection', features: [] } }
    ])
    expect(geographies).toHaveLength(2)
  })

  it('Test Write Geographies Metadata', async () => {
    const metadata = await GeographyServiceClient.writeGeographiesMetadata([
      {
        geography_id,
        geography_metadata: { status: 'original' }
      }
    ])
    expect(metadata).toHaveLength(1)
  })

  it('Test Modify Geographies Metadata', async () => {
    const metadata = await GeographyServiceClient.writeGeographiesMetadata([
      {
        geography_id,
        geography_metadata: { status: 'modified' }
      }
    ])
    expect(metadata).toHaveLength(1)
  })

  it('Test Get All Geographies', async () => {
    const geographies = await GeographyServiceClient.getGeographies()
    expect(geographies).toHaveLength(2)
  })

  it('Test Get Draft Geographies', async () => {
    const geographies = await GeographyServiceClient.getGeographies({ status: 'draft' })
    expect(geographies).toHaveLength(1)
  })

  it('Test Get Published Geographies', async () => {
    const geographies = await GeographyServiceClient.getGeographies({ status: 'published' })
    expect(geographies).toHaveLength(1)
  })

  it('Test Get Draft Geographies with Metadata', async () => {
    const [geography, ...others] = await GeographyServiceClient.getGeographiesWithMetadata({ status: 'draft' })
    expect(others).toHaveLength(0)
    expect(geography.geography_metadata).toBeNull()
  })

  it('Test Get Published Geographies with Metadata', async () => {
    const [geography, ...others] = await GeographyServiceClient.getGeographiesWithMetadata({ status: 'published' })
    expect(others).toHaveLength(0)
    expect(geography.geography_metadata).toEqual({ status: 'modified' })
  })

  it('Test Get Geography', async () => {
    const geography = await GeographyServiceClient.getGeography(geography_id)
    expect(geography).not.toBeUndefined()
    expect(geography?.geography_id).toEqual(geography_id)
  })

  it('Test Get Geography with Metadata', async () => {
    const geography = await GeographyServiceClient.getGeographyWithMetadata(geography_id)
    expect(geography).not.toBeUndefined()
    expect(geography?.geography_id).toEqual(geography_id)
    expect(geography?.geography_metadata).toEqual({ status: 'modified' })
  })

  it('Test Get Geography (Not Found)', async () => {
    const geography = await GeographyServiceClient.getGeography(uuid())
    expect(geography).toBeUndefined()
  })

  it('Test Get Geography with Metadata (Not Found)', async () => {
    const geography = await GeographyServiceClient.getGeographyWithMetadata(uuid())
    expect(geography).toBeUndefined()
  })

  afterAll(async () => {
    await GeographyServer.stop()
  })
})
