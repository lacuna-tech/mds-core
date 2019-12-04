import Sinon from 'sinon'
import * as db from 'packages/mds-db/processors'
import { MetricsTableRow } from '@mds-core/mds-types'
import assert from 'assert'
import * as requestHandlers from '../request-handlers'
import { MetricsApiRequest, GetAllResponse } from '../types'

describe('Request handlers', () => {
  it('Dumps the correct metrics', async () => {
    const req: MetricsApiRequest = {
      body: {
        start_time: 10,
        end_time: 20,
        bin_size: 100
      }
    } as MetricsApiRequest

    const send = Sinon.fake.returns('boop')
    const status = Sinon.fake.returns({ send })
    const res: GetAllResponse = ({
      status
    } as unknown) as GetAllResponse

    const fakeMetricsRows: MetricsTableRow[] = []

    Sinon.replace(db, 'getAllMetrics', Sinon.fake.resolves(fakeMetricsRows))
    await requestHandlers.getAll(req, res)

    assert.strictEqual(status.calledOnceWithExactly(200), true)
    assert.strictEqual(send.calledOnce, true)

    Sinon.restore()
  })
})
