import { TransactionServiceManager } from '@lacuna-core/lacuna-transaction-service/service/manager'

const TransactionServer = TransactionServiceManager.controller()

describe('Test Transactions API', () => {
  beforeAll(async () => {
    await TransactionServer.start()
  })

  it('Runs a test', () => {
    // eslint-disable-next-line no-console
    console.log('You did it!')
  })

  afterAll(async () => {
    await TransactionServer.stop()
  })
})
