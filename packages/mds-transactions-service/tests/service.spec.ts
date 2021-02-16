/**
 * Copyright 2020 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { uuid } from '@mds-core/mds-utils'
import { TransactionServiceManager } from '../service/manager'
import { TransactionServiceClient } from '../client'
import { TransactionRepository } from '../repository'
import {
  TransactionDomainModel,
  TransactionOperationDomainCreateModel,
  TransactionStatusDomainCreateModel
} from '../@types'

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
const unknown_provider_id = '654b106d-5706-495f-8c89-64e17a5a3ed8'
const transaction_id = '37bd96ac-69bd-4634-9b22-ff081d7a5a09'
const unknown_transaction_id = '822415eb-baaa-40ff-b219-a5ed214e2114'
const receipt_id = 'a5eb612e-a154-4339-a760-aee95908dc51'
const operation_id = '4fcbbd4f-c0cb-46b7-b7dd-55ebae535493'
const status_id = '15c99c65-cf78-46a9-9055-c9973e43f061'
const receipt = { receipt_id, timestamp: Date.now(), receipt_details: {}, origin_url: '' }

/**
 * Generator for Transactions.
 * @param length How many transactions to generate
 */
function* transactionsGenerator(length = 20): Generator<TransactionDomainModel> {
  const start_timestamp = Date.now() - length * 1000

  for (let i = 0; i < length; i++) {
    const timestamp = start_timestamp + i * 1000

    yield {
      transaction_id: uuid(),
      provider_id,
      device_id,
      timestamp,
      amount: 100, // "I'd buy THAT for a dollar!"
      fee_type: 'base_fee',
      receipt
    }
  }
}

const malformed_uuid = '176b8453-ccaf-41c7-a4df-f7b3f80bddd1xxxxxxx'

describe('Transaction Service Tests', () => {
  beforeAll(async () => {
    await TransactionServer.start()
  })

  /**
   * Clear DB after each test runs. No side-effects for you.
   */
  afterEach(async () => {
    await Promise.all([
      TransactionRepository.deleteAllTransactions(),
      TransactionRepository.deleteAllTransactionOperations(),
      TransactionRepository.deleteAllTransactionStatuses()
    ])
  })

  describe('Transaction Tests', () => {
    describe('Transaction Creation Tests', () => {
      describe('Success Tests', () => {
        it('Create one good transaction succeeds', async () => {
          const transaction = await TransactionServiceClient.createTransaction({
            transaction_id,
            provider_id,
            device_id,
            timestamp: Date.now() - 100000,
            amount: 100, // "I'd buy THAT for a dollar!"
            fee_type: 'base_fee',
            receipt
          })
          expect(transaction.device_id).toEqual(device_id)
          expect(transaction.transaction_id).toEqual(transaction_id)
        })

        it('Verifies good bulk-transaction creation', async () => {
          const transactionsToPersist = [...transactionsGenerator(20)]
          const recordedTransactions = await TransactionServiceClient.createTransactions(transactionsToPersist)

          recordedTransactions.forEach((transaction, i) => {
            expect(transaction.device_id).toEqual(transactionsToPersist[i].device_id)
          })

          expect(recordedTransactions.length).toStrictEqual(transactionsToPersist.length)
        })
      })

      describe('Failure Tests', () => {
        it('Create one transaction with malformed transaction_id rejects', async () => {
          await expect(
            TransactionServiceClient.createTransaction({
              transaction_id: malformed_uuid,
              provider_id,
              device_id,
              timestamp: Date.now(),
              amount: 100, // "I'd buy THAT for a dollar!"
              fee_type: 'base_fee',
              receipt
            })
          ).rejects.toMatchObject({ type: 'ValidationError' })
        })

        it('Create one transaction with missing fee_type rejects', async () => {
          await expect(
            TransactionServiceClient.createTransaction({
              transaction_id: malformed_uuid,
              provider_id,
              device_id,
              timestamp: Date.now(),
              amount: 100, // "I'd buy THAT for a dollar!"
              receipt
            } as any)
          ).rejects.toMatchObject({ type: 'ValidationError' })
        })

        it('Post Transaction duplicate transaction_id', async () => {
          const [transaction] = [...transactionsGenerator(1)]

          await TransactionServiceClient.createTransaction(transaction)

          await expect(TransactionServiceClient.createTransaction(transaction)).rejects.toMatchObject({
            type: 'ConflictError'
          })
        })
      })
    })

    describe('Transaction Read Tests', () => {
      describe('Success', () => {
        it('Get One Transaction', async () => {
          const [transactionToPersist] = [...transactionsGenerator(1)]
          const recordedTransaction = await TransactionServiceClient.createTransaction(transactionToPersist)

          const fetchedTransaction = await TransactionServiceClient.getTransaction(recordedTransaction.transaction_id)
          expect(fetchedTransaction).toStrictEqual(recordedTransaction)
        })

        it('Verifies that get all transactions with no options uses the default limit', async () => {
          // We'll just generate a bunch of transactions here to test
          const transactionsToPersist = [...transactionsGenerator(100)]
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions } = await TransactionServiceClient.getTransactions()
          expect(transactions.length).toEqual(10)
        })

        it('Get All Transactions with provider search and paging', async () => {
          const transactionsToPersist = [...transactionsGenerator(21)] // Arbitrarily generate 21 events, just so we can verify paging works w/ default page size on a handful of pages.
          await TransactionServiceClient.createTransactions(transactionsToPersist)

          const { transactions: firstPage, cursor: firstCursor } = await TransactionServiceClient.getTransactions({
            provider_id
          })
          expect(firstPage.length).toEqual(10) // page size

          const { transactions: secondPage, cursor: secondCursor } = await TransactionServiceClient.getTransactions({
            provider_id,
            after: firstCursor.afterCursor ?? undefined
          })
          expect(secondPage.length).toEqual(10) // page size

          const { transactions: lastPage } = await TransactionServiceClient.getTransactions({
            provider_id,
            after: secondCursor.afterCursor ?? undefined
          })
          expect(lastPage.length).toEqual(1) // page size
        })
      })

      describe('Failure', () => {
        it('Verify that asking for too many items will fail (i.e. is Joi doing its job)', async () => {
          try {
            await TransactionServiceClient.getTransactions({ limit: 10000 })
            expect('did not happen').toBe('happened')
          } catch (err) {
            expect(err.type).toBe('ValidationError')
          }
        })

        it('Get All Transactions with bogus provider serach', async () => {
          const { transactions } = await TransactionServiceClient.getTransactions({
            provider_id: unknown_provider_id
          })
          expect(transactions.length).toEqual(0)
        })
      })
    })
  })

  describe('Transaction Operation Tests', () => {
    const sampleOperation: TransactionOperationDomainCreateModel = {
      transaction_id,
      operation_id,
      timestamp: Date.now(),
      operation_type: 'invoice_generated',
      author: 'no one'
    }

    describe('Transaction Operation Create Tests', () => {
      describe('Success', () => {
        it('Post Good Transaction Operation', async () => {
          const operation = await TransactionServiceClient.addTransactionOperation(sampleOperation)
          expect(operation.operation_id).toEqual(operation_id)
          expect(operation.transaction_id).toEqual(transaction_id)
        })
      })

      describe('Failure', () => {
        it('Post Duplicate Transaction Operation', async () => {
          await TransactionServiceClient.addTransactionOperation(sampleOperation)

          await expect(TransactionServiceClient.addTransactionOperation(sampleOperation)).rejects.toMatchObject({
            type: 'ConflictError'
          })
        })
      })
    })

    describe('Transaction Operation Read Tests', () => {
      beforeAll(async () => {
        await TransactionServiceClient.addTransactionOperation(sampleOperation)
      })

      it('Get All Transaction Operations for One Transaction', async () => {
        const operations = await TransactionServiceClient.getTransactionOperations(transaction_id)
        expect(operations.length).toEqual(1)
        const [operation] = operations
        expect(operation.operation_id).toEqual(operation_id)
      })

      it('Get All Transaction Operations for One Nonexistant Transaction', async () => {
        const operations = await TransactionServiceClient.getTransactionOperations(unknown_transaction_id)
        expect(operations.length).toEqual(0)
      })
    })

    // search with non-existant-transaction-id

    // post op with missing fields
    // post op with bad op
    // post op with non-UUID
    // post op on non-existant transaction id
  })

  describe('Transaction Status Tests', () => {
    it('Post Good Transaction Status', async () => {
      const transactionStatus = await TransactionServiceClient.setTransactionStatus({
        transaction_id,
        status_id,
        timestamp: Date.now(),
        status_type: 'invoice_generated',
        author: 'no one'
      })
      expect(transactionStatus.status_id).toEqual(status_id)
      expect(transactionStatus.transaction_id).toEqual(transaction_id)
    })

    it('Get All Transaction Statuses', async () => {
      const transactionStatus: TransactionStatusDomainCreateModel = {
        transaction_id,
        status_id,
        timestamp: Date.now(),
        status_type: 'invoice_generated',
        author: 'no one'
      }

      await TransactionServiceClient.setTransactionStatus(transactionStatus)

      const statuses = await TransactionServiceClient.getTransactionStatuses(transaction_id)
      expect(statuses.length).toEqual(1)
      const [status] = statuses
      expect(status.status_id).toEqual(status_id)
    })

    it('Get All Transaction Statuses for One Nonexistant Transaction', async () => {
      const statuses = await TransactionServiceClient.getTransactionStatuses(unknown_transaction_id)
      expect(statuses.length).toEqual(0)
    })

    // TODO
    // search with non-existant-transaction-id
    // post dup stat id
    // post stat with missing fields
    // post stat with non-UUID
    // post stat with bad stat
    // post stat on non-existant transaction id
  })

  afterAll(async () => {
    await TransactionServer.stop()
  })
})
