import Sinon from 'sinon'
import db from '@mds-core/mds-db'
import { MetricsTableRow } from '@mds-core/mds-types'
import assert from 'assert'
import uuid from 'uuid'
import * as requestHandlers from '../request-handlers'
import { MetricsApiRequest, GetAllResponse } from '../types'
import * as utils from '@mds-core/mds-utils'

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

  it('Handles TSV format correctly', async () => {
    const provider_id = uuid()
    const req: MetricsApiRequest = {
      body: {
        start_time: 100,
        end_time: 400,
        bin_size: 100
      },
      query: {
        provider_id,
        format: 'tsv'
      }
    } as MetricsApiRequest

    const send = Sinon.fake.returns('boop')
    const status = Sinon.fake.returns({ send })
    const res: GetAllResponse = ({
      status
    } as unknown) as GetAllResponse

    const fakeMetricsRows: MetricsTableRow[] = [
      {
        foo: 10,
        bar: 11,
        baz: 12
      } as unknown as MetricsTableRow,
      {
        foo: 1,
        bar: 2,
        baz: 3
      } as unknown as MetricsTableRow,
    ]
    const fakeGetAll = Sinon.fake.resolves(fakeMetricsRows)
    Sinon.replace(db, 'getAllMetrics', fakeGetAll)
    await requestHandlers.getAll(req, res)
    assert.deepStrictEqual(fakeGetAll.args[0][0].geography_id, null)
    assert.deepStrictEqual(fakeGetAll.args[0][0].provider_id, provider_id)

    assert.strictEqual(status.calledOnceWithExactly(200), true)
    assert.strictEqual(send.calledOnce, true)
    Sinon.replace(utils, 'getCurrentDate', Sinon.fake.returns(new Date('1995-12-17T03:24:00')))
    // This test is potentially time-dependent b/c 'today' is relative to current system
    // This is why we replace the util function to return a specific date...jank, I know
    assert.deepStrictEqual(send.args[0][0].map((entry : { data: unknown }) => entry.data), [
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3',
      '"foo"\t"bar"\t"baz"\n10\t11\t12\n1\t2\t3'
    ])

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

  it('Handles invalid format param gracefully', async () => {
    const provider_id = uuid()
    const req: MetricsApiRequest = {
      body: {
        start_time: 100,
        end_time: 400,
        bin_size: 100
      },
      query: {
        provider_id,
        format: 'not-valid'
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
