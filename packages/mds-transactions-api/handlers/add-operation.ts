import { TransactionServiceClient } from '@mds-core/mds-transactions-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { TransactionOperationDomainModel } from '@mds-core/mds-transactions-service/@types'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiAddTransactionOperationRequest = TransactionApiRequest<TransactionOperationDomainModel>

export type TransactionApiAddTransactionOperationResponse = TransactionApiResponse<{
  transaction: TransactionOperationDomainModel
}>

export const AddTransactionOperationHandler = async (
  req: TransactionApiAddTransactionOperationRequest,
  res: TransactionApiAddTransactionOperationResponse
) => {
  try {
    const transaction = await TransactionServiceClient.addTransactionOperation(req.body)
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
