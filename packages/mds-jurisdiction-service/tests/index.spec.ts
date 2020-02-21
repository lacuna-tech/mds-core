import test from 'unit.js'
import uuid from 'uuid'
import { ConnectionManager } from '@mds-core/mds-orm'
import { InsertReturning } from '@mds-core/mds-orm/types'
import { NotFoundError } from 'packages/mds-utils'
import { days } from '@mds-core/mds-utils'
import { JurisdictionEntity } from '../entities/jurisdiction-entity'
import { JurisdictionService } from '../index'
import ormconfig from '../ormconfig'

const records = 5_000
const recorded = Date.now()
const manager = ConnectionManager(ormconfig)

const JURISDICTION_ID = uuid()
const TODAY = Date.now()
const YESTERDAY = TODAY - days(1)
const LAST_WEEK = TODAY - days(7)

describe('Write/Read Jurisdictions', () => {
  before(async () => {
    await manager.initialize()
  })

  it(`Write ${records} Jurisdiction${records > 1 ? 's' : ''}`, async () => {
    const connection = await manager.getReadWriteConnection()
    const jurisdictions: Omit<JurisdictionEntity, 'id'>[] = Array.from({ length: records }, (_, index) => ({
      jurisdiction_id: index ? uuid() : JURISDICTION_ID,
      agency_key: `agency-${index}`,
      versions: [
        {
          timestamp: TODAY,
          agency_name: `Agency ${index}`,
          geography_id: uuid()
        },
        {
          timestamp: YESTERDAY,
          agency_name: `Agency ${index}`,
          geography_id: uuid()
        }
      ],
      recorded
    }))
    try {
      const repository = connection.getRepository(JurisdictionEntity)
      const { raw: returning }: InsertReturning<JurisdictionEntity> = await repository
        .createQueryBuilder()
        .insert()
        .values(jurisdictions)
        .returning('*')
        .onConflict('DO NOTHING')
        .execute()
      test.value(returning.some(jurisdiction => jurisdiction.id === undefined)).is(false)
      test.value(returning[0].jurisdiction_id).is(JURISDICTION_ID)
    } finally {
      await connection.close()
    }
  })

  it(`Read ${records} Jurisdiction${records > 1 ? 's' : ''}`, async () => {
    const [error, jurisdictions] = await JurisdictionService.getAllJurisdictions()
    test.value(jurisdictions).isNot(null)
    test.value(jurisdictions?.length).is(records)
    test.value(jurisdictions?.[0].jurisdiction_id).is(JURISDICTION_ID)
    test.value(error).is(null)
  })

  it('Read Specific Jurisdiction (current version)', async () => {
    const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(JURISDICTION_ID)
    test.value(jurisdiction).isNot(null)
    test.value(jurisdiction?.jurisdiction_id).is(JURISDICTION_ID)
    test.value(jurisdiction?.timestamp).is(TODAY)
    test.value(error).is(null)
  })

  it('Read Specific Jurisdiction (prior version)', async () => {
    const [error, jurisdiction] = await JurisdictionService.getOneJurisdiction(JURISDICTION_ID, {
      effective: YESTERDAY
    })
    test.value(jurisdiction).isNot(null)
    test.value(jurisdiction?.jurisdiction_id).is(JURISDICTION_ID)
    test.value(jurisdiction?.timestamp).is(YESTERDAY)
    test.value(error).is(null)
  })

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
    await manager.shutdown()
  })
})
