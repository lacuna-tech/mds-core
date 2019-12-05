import Sinon from 'sinon'
import db from '@mds-core/mds-db'
import { MetricsTableRow } from '@mds-core/mds-types'
import assert from 'assert'
import uuid from 'uuid'
import * as requestHandlers from '../request-handlers'
import { MetricsApiRequest, GetAllResponse } from '../types'

describe('Request handlers', () => {
  it('Dumps the correct metrics without forwarding query params', async () => {
    const req: MetricsApiRequest = {
      body: {
        start_time: 100,
        end_time: 400,
        bin_size: 100
      },
      query: {}
    } as MetricsApiRequest

    const send = Sinon.fake.returns('boop')
    const status = Sinon.fake.returns({ send })
    const res: GetAllResponse = ({
      status
    } as unknown) as GetAllResponse

    const fakeMetricsRows: MetricsTableRow[] = []
    const fakeGetAll = Sinon.fake.resolves(fakeMetricsRows)
    Sinon.replace(db, 'getAllMetrics', fakeGetAll)
    await requestHandlers.getAll(req, res)
    assert.deepStrictEqual(fakeGetAll.args[0][0].geography_id, null)
    assert.deepStrictEqual(fakeGetAll.args[0][0].provider_id, null)

    assert.strictEqual(status.calledOnceWithExactly(200), true)
    assert.strictEqual(send.calledOnce, true)

    Sinon.restore()
  })

  it('Dumps the correct metrics while forwarding query params', async () => {
    const provider_id = uuid()
    const req: MetricsApiRequest = {
      body: {
        start_time: 100,
        end_time: 400,
        bin_size: 100
      },
      query: {
        provider_id
      }
    } as MetricsApiRequest

    const send = Sinon.fake.returns('boop')
    const status = Sinon.fake.returns({ send })
    const res: GetAllResponse = ({
      status
    } as unknown) as GetAllResponse

    const fakeMetricsRows: MetricsTableRow[] = []
    const fakeGetAll = Sinon.fake.resolves(fakeMetricsRows)
    Sinon.replace(db, 'getAllMetrics', fakeGetAll)
    await requestHandlers.getAll(req, res)
    assert.deepStrictEqual(fakeGetAll.args[0][0].geography_id, null)
    assert.deepStrictEqual(fakeGetAll.args[0][0].provider_id, provider_id)

    assert.strictEqual(status.calledOnceWithExactly(200), true)
    assert.strictEqual(send.calledOnce, true)

    Sinon.restore()
  })

  it('Handles invalid provider_id UUID query params gracefully', async () => {
    const provider_id = 'not-a-uuid'
    const req: MetricsApiRequest = {
      body: {
        start_time: 100,
        end_time: 400,
        bin_size: 100
      },
      query: {
        provider_id
      }
    } as MetricsApiRequest

    const send = Sinon.fake.returns('boop')
    const status = Sinon.fake.returns({ send })
    const res: GetAllResponse = ({
      status
    } as unknown) as GetAllResponse

    await requestHandlers.getAll(req, res)

    assert.strictEqual(status.calledOnceWithExactly(400), true)
    assert.strictEqual(send.calledOnce, true)

    Sinon.restore()
  })
})
