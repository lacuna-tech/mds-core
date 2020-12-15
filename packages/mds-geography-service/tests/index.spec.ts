import { uuid, now, days } from '@mds-core/mds-utils'
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

  it('Write Geographies', async () => {
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

  it('Write Geographies Metadata', async () => {
    const metadata = await GeographyServiceClient.writeGeographiesMetadata([
      {
        geography_id,
        geography_metadata: { status: 'original' }
      }
    ])
    expect(metadata).toHaveLength(1)
  })

  it('Modify Geographies Metadata', async () => {
    const metadata = await GeographyServiceClient.writeGeographiesMetadata([
      {
        geography_id,
        geography_metadata: { status: 'modified' }
      }
    ])
    expect(metadata).toHaveLength(1)
  })

  it('Get All Geographies', async () => {
    const geographies = await GeographyServiceClient.getGeographies()
    expect(geographies).toHaveLength(2)
    geographies.forEach(geography => expect(geography.geography_metadata).toBeUndefined())
  })

  it('Get Unpublished Geographies', async () => {
    const geographies = await GeographyServiceClient.getUnpublishedGeographies()
    expect(geographies).toHaveLength(1)
    geographies.forEach(geography => expect(geography.geography_metadata).toBeUndefined())
  })

  it('Get Unpublished Geographies with Metadata', async () => {
    const [geography, ...others] = await GeographyServiceClient.getUnpublishedGeographies({ includeMetadata: true })
    expect(others).toHaveLength(0)
    expect(geography.geography_metadata).toBeNull()
  })

  it('Get Published Geographies', async () => {
    const geographies = await GeographyServiceClient.getPublishedGeographies()
    expect(geographies).toHaveLength(1)
    geographies.forEach(geography => expect(geography.geography_metadata).toBeUndefined())
  })

  it('Get Geographies Published After Date', async () => {
    const geographies = await GeographyServiceClient.getPublishedGeographies({ publishedAfter: now() + days(1) })
    expect(geographies).toHaveLength(0)
  })

  it('Get Published Geographies with Metadata', async () => {
    const [geography, ...others] = await GeographyServiceClient.getPublishedGeographies({ includeMetadata: true })
    expect(others).toHaveLength(0)
    expect(geography.geography_metadata).toEqual({ status: 'modified' })
  })

  it('Get Single Geography', async () => {
    const geography = await GeographyServiceClient.getGeography(geography_id)
    expect(geography).not.toBeUndefined()
    expect(geography?.geography_id).toEqual(geography_id)
    expect(geography?.geography_metadata).toBeUndefined()
  })

  it('Get Single Geography with Metadata', async () => {
    const geography = await GeographyServiceClient.getGeography(geography_id, { includeMetadata: true })
    expect(geography).not.toBeUndefined()
    expect(geography?.geography_id).toEqual(geography_id)
    expect(geography?.geography_metadata).toEqual({ status: 'modified' })
  })

  it('Get Single Geography (Not Found)', async () => {
    const geography = await GeographyServiceClient.getGeography(uuid())
    expect(geography).toBeUndefined()
  })

  it('Get Single Geography with Metadata (Not Found)', async () => {
    const geography = await GeographyServiceClient.getGeography(uuid(), { includeMetadata: true })
    expect(geography).toBeUndefined()
  })

  afterAll(async () => {
    await GeographyServer.stop()
  })
})
