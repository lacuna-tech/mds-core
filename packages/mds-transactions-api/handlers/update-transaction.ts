import { TransactionServiceClient, TransactionDomainModel } from '@lacuna-core/lacuna-transaction-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiUpdateTransactionRequest = TransactionApiRequest<TransactionDomainModel>

export type TransactionApiUpdateTransactionResponse = TransactionApiResponse<{ transaction: TransactionDomainModel }>

export const UpdateTransactionHandler = async (req: TransactionApiUpdateTransactionRequest, res: TransactionApiUpdateTransactionResponse) => {
  try {
    const { body } = req
    const transaction = await TransactionServiceClient.updateTransaction(body)
    const { version } = res.locals
    return res.status(200).send({ version, transaction })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'ValidationError') {
        return res.status(400).send({ error })
      }
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
      if (error.type === 'ConflictError') {
        return res.status(409).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
