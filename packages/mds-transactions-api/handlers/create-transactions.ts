import { TransactionServiceClient, TransactionDomainModel } from '@lacuna-core/lacuna-transaction-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiCreateTransactionsRequest = TransactionApiRequest<TransactionDomainModel[]>

export type TransactionApiCreateTransactionsResponse = TransactionApiResponse<{ transactions: TransactionDomainModel[] }>

// TODO consolidate with create single
export const CreateTransactionsHandler = async (req: TransactionApiCreateTransactionsRequest, res: TransactionApiCreateTransactionsResponse) => {
  try {
    const transactions = await TransactionServiceClient.createTransactions(req.body)
    const { version } = res.locals
    return res.status(201).send({ version, transactions })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'ValidationError') {
        return res.status(400).send({ error })
      }
      if (error.type === 'ConflictError') {
        return res.status(409).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
