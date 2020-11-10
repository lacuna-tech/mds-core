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

describe('Transaction Service Tests', () => {
  beforeAll(async () => {
    await TransactionServer.start()
  })

  it('Post Transaction', async () => {
    const transaction = await TransactionServiceClient.createTransaction({ name: 'Test Transaction', text: 'This is a test' })
    expect(transaction.name).toEqual('Test Transaction')
  })

  it('Get All Transactions', async () => {
    const transactions = await TransactionServiceClient.getTransactions()
    expect(transactions.length).toEqual(1)
    const [transaction] = transactions
    expect(transaction.name).toEqual('Test Transaction')
  })

  it('Get One Transaction', async () => {
    const transaction = await TransactionServiceClient.getTransaction('Test Transaction')
    expect(transaction.name).toEqual('Test Transaction')
  })

  afterAll(async () => {
    await TransactionServer.stop()
  })
})
