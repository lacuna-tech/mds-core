import test from 'unit.js'
import uuid from 'uuid'
import { NotFoundError, days } from '@mds-core/mds-utils'
import { JurisdictionService } from '../index'

const records = 5_000

const JURISDICTION_ID = uuid()
const TODAY = Date.now()
const YESTERDAY = TODAY - days(1)
const LAST_WEEK = TODAY - days(7)

describe('Write/Read Jurisdictions', () => {
  before(async () => {
    await JurisdictionService.initialize()
  })

  it(`Write ${records} Jurisdiction${records > 1 ? 's' : ''}`, async () => {
    const [error, jurisdictions] = await JurisdictionService.createJurisdictions(
      Array.from({ length: records }, (_, index) => ({
        jurisdiction_id: index ? uuid() : JURISDICTION_ID,
        agency_key: `agency-key-${index}`,
        agency_name: `Agency Name ${index}`,
        timestamp: YESTERDAY,
        geography_id: uuid()
      }))
    )
    test.value(jurisdictions).isNot(null)
    test.value(jurisdictions?.[0].jurisdiction_id).is(JURISDICTION_ID)
    test.value(error).is(null)
  })

  it(`Read ${records} Jurisdiction${records > 1 ? 's' : ''}`, async () => {
    const [error, jurisdictions] = await JurisdictionService.getAllJurisdictions()
    test.value(jurisdictions).isNot(null)
    test.value(jurisdictions?.length).is(records)
    test.value(jurisdictions?.[0].jurisdiction_id).is(JURISDICTION_ID)
    test.value(error).is(null)
  })

  it('Write One Jurisdiction', async () => {
    const [error, jurisdiction] = await JurisdictionService.createJurisdiction({
      agency_key: 'agency-key-one',
      agency_name: 'Agency Name One',
      geography_id: uuid()
    })
    test.value(jurisdiction).isNot(null)
    test.value(jurisdiction?.jurisdiction_id).isNot(null)
    test.value(jurisdiction?.timestamp).isNot(null)
    test.value(error).is(null)
  })

  it('Write One Jurisdiction (duplicate id)', async () => {
    const [error, jurisdiction] = await JurisdictionService.createJurisdiction({
      jurisdiction_id: JURISDICTION_ID,
      agency_key: 'agency-key-two',
      agency_name: 'Agency Name One',
      geography_id: uuid()
    })
    test
      .value(error)
      .isNot(null)
      .isInstanceOf(Error)
    test.value(jurisdiction).is(null)
  })

  it('Write One Jurisdiction (duplicate key)', async () => {
    const [error, jurisdiction] = await JurisdictionService.createJurisdiction({
      agency_key: 'agency-key-one',
      agency_name: 'Agency Name One',
      geography_id: uuid()
    })
    test
      .value(error)
      .isNot(null)
      .isInstanceOf(Error)
    test.value(jurisdiction).is(null)
  })

  it('Read Specific Jurisdiction (current version)', async () => {
    const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(JURISDICTION_ID)
    test.value(jurisdiction).isNot(null)
    test.value(jurisdiction?.jurisdiction_id).is(JURISDICTION_ID)
    test.value(jurisdiction?.timestamp).is(YESTERDAY)
    test.value(error).is(null)
  })

  // it('Read Specific Jurisdiction (prior version)', async () => {
  //   const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(JURISDICTION_ID, {
  //     effective: YESTERDAY
  //   })
  //   test.value(jurisdiction).isNot(null)
  //   test.value(jurisdiction?.jurisdiction_id).is(JURISDICTION_ID)
  //   test.value(jurisdiction?.timestamp).is(YESTERDAY)
  //   test.value(error).is(null)
  // })

  it('Read Specific Jurisdiction (no version)', async () => {
    const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(JURISDICTION_ID, {
      effective: LAST_WEEK
    })
    test
      .value(error)
      .isNot(null)
      .isInstanceOf(NotFoundError)
    test.value(jurisdiction).is(null)
  })

  it('Read Missing Jurisdiction', async () => {
    const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(uuid())
    test
      .value(error)
      .isNot(null)
      .isInstanceOf(NotFoundError)
    test.value(jurisdiction).is(null)
  })

  after(async () => {
    await JurisdictionService.shutdown()
  })
})
