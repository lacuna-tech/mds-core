import { TransactionServiceClient } from '@mds-core/mds-transactions-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { TransactionStatusDomainModel } from '@mds-core/mds-transactions-service/@types'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiSetTransactionStatusRequest = TransactionApiRequest<TransactionStatusDomainModel>

export type TransactionApiSetTransactionStatusResponse = TransactionApiResponse<{
  status: TransactionStatusDomainModel
}>

export const SetTransactionStatusHandler = async (
  req: TransactionApiSetTransactionStatusRequest,
  res: TransactionApiSetTransactionStatusResponse
) => {
  try {
    const status = await TransactionServiceClient.setTransactionStatus(req.body)
    const { version } = res.locals
    return res.status(201).send({ version, status })
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
