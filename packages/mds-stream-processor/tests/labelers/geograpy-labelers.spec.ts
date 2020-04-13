import { GeographyLabeler } from '@mds-core/mds-stream-processor/labelers/geography-labeler'
import * as geographyLabelerMethods from '@mds-core/mds-stream-processor/labelers/geography-labeler'
import * as utils from '@mds-core/mds-utils'
import db from '@mds-core/mds-db'
import Sinon from 'sinon'
import { Geography } from '@mds-core/mds-types'
import { v4 as uuid } from 'uuid'
import assert from 'assert'
import { BBox } from '@turf/helpers'

const mockGeographies: Geography[] = Array.from({ length: 100 }, () => ({
  geography_id: uuid(),
  geography_json: {
    type: 'FeatureCollection',
    features: []
  },
  name: uuid() // Usually intended to be a human readable name, but we just need a random string here.
}))

const mockTelemetry = {
  provider_id: uuid(),
  device_id: uuid(),
  timestamp: utils.now(),
  gps: { lat: 34.0522, lng: 118.2437 },
  recorded: utils.now()
}

describe('GeographyLabeler tests', async () => {
  afterEach(() => {
    Sinon.restore()
  })

  it('Tests pointInBbox: true, pointInShape: true elicits matches', async () => {
    Sinon.stub(geographyLabelerMethods, 'pointInBbox').returns(true)
    Sinon.stub(utils, 'pointInShape').returns(true)
    Sinon.stub(db, 'readGeographies').returns(Promise.resolve(mockGeographies))

    const { geography_ids } = await GeographyLabeler()({ telemetry: mockTelemetry })

    geography_ids.forEach(geography_id =>
      assert(mockGeographies.find(geography => geography.geography_id === geography_id))
    )
  })

  it('Tests that absent gps in telemetry elicits no matches', async () => {
    const { geography_ids } = await GeographyLabeler()({})
    assert(geography_ids.length === [].length)
  })

  it('Tests that pointInBbox: false, pointInShape: true elicits no matches', async () => {
    Sinon.stub(geographyLabelerMethods, 'pointInBbox').returns(false)
    Sinon.stub(utils, 'pointInShape').returns(true)
    Sinon.stub(db, 'readGeographies').returns(Promise.resolve(mockGeographies))

    const { geography_ids } = await GeographyLabeler()({ telemetry: mockTelemetry })

    assert(geography_ids.length === [].length)
  })

  it('Tests that pointInBbox: true, pointInShape: false elicits no matches', async () => {
    Sinon.stub(geographyLabelerMethods, 'pointInBbox').returns(true)
    Sinon.stub(utils, 'pointInShape').returns(false)
    Sinon.stub(db, 'readGeographies').returns(Promise.resolve(mockGeographies))

    const { geography_ids } = await GeographyLabeler()({ telemetry: mockTelemetry })

    assert(geography_ids.length === [].length)
  })

  it('Tests pointInBbox success', async () => {
    const bbox = [0, 0, 10, 10] as BBox
    const point = { lat: 5, lng: 5 }

    assert(geographyLabelerMethods.pointInBbox(point, bbox) === true)
  })

  it('Tests pointInBbox failure', async () => {
    const bbox = [0, 0, 10, 10] as BBox
    const point = { lat: 15, lng: 15 }

    assert(geographyLabelerMethods.pointInBbox(point, bbox) === false)
  })
})
