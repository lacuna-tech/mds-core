import { TransactionServiceManager } from '../service/manager'
import { TransactionServiceClient } from '../client'
import { TransactionRepository } from '../repository'

describe('Transaction Repository Tests', () => {
  beforeAll(async () => {
    await TransactionRepository.initialize()
  })

  it('Run Migrations', async () => {
    await TransactionRepository.runAllMigrations()
  })

  it('Revert Migrations', async () => {
    await TransactionRepository.revertAllMigrations()
  })

  afterAll(async () => {
    await TransactionRepository.shutdown()
  })
})

const TransactionServer = TransactionServiceManager.controller()

const device_id = 'ee6bf5c7-bce0-46c9-a5c9-8652724059d7'
const provider_id = '3452fa87-bfd7-42c5-9c53-5e07bde13671'
const transaction_id = '37bd96ac-69bd-4634-9b22-ff081d7a5a09'
const receipt_id = 'a5eb612e-a154-4339-a760-aee95908dc51'

describe('Transaction Service Tests', () => {
  beforeAll(async () => {
    await TransactionServer.start()
  })

  it('Post Transaction', async () => {
    const transaction = await TransactionServiceClient.createTransaction({
      transaction_id,
      provider_id,
      device_id,
      timestamp: Date.now(),
      amount: 100, // "I'd buy THAT for a dollar!"
      fee_type: 'base_fee',
      receipt: { receipt_id, timestamp: Date.now(), receipt_details: {}, origin_url: '' }
    })
    expect(transaction.device_id).toEqual(device_id)
    expect(transaction.transaction_id).toEqual(transaction_id)
  })

  it('Get All Transactions', async () => {
    const transactions = await TransactionServiceClient.getTransactions()
    expect(transactions.length).toEqual(1)
    const [transaction] = transactions
    expect(transaction.transaction_id).toEqual(transaction_id)
  })

  it('Get One Transaction', async () => {
    const transaction = await TransactionServiceClient.getTransaction(transaction_id)
    expect(transaction.transaction_id).toEqual(transaction_id)
  })

  afterAll(async () => {
    await TransactionServer.stop()
  })
})
