import { TransactionServiceClient, TransactionDomainModel } from '@mds-core/mds-transactions-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiCreateTransactionRequest = TransactionApiRequest<TransactionDomainModel>

export type TransactionApiCreateTransactionResponse = TransactionApiResponse<{ transaction: TransactionDomainModel }>

export const CreateTransactionHandler = async (
  req: TransactionApiCreateTransactionRequest,
  res: TransactionApiCreateTransactionResponse
) => {
  try {
    const transaction = await TransactionServiceClient.createTransaction(req.body)
    const { version } = res.locals
    return res.status(201).send({ version, transaction })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'ValidationError') {
        return res.status(400).send({ error })
      }
      if (error.type === 'ConflictError') {
        return res.status(409).send({ error })
      }
    }
    return res.status(500).send({ error: new ServerError(error) })
  }
}
