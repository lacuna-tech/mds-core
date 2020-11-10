import { TransactionServiceClient, TransactionDomainModel } from '@mds-core/mds-transactions-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiDeleteTransactionRequest = TransactionApiRequest & ApiRequestParams<'name'>

export type TransactionApiDeleteTransactionResponse = TransactionApiResponse<{ name: TransactionDomainModel['name'] }>

export const DeleteTransactionHandler = async (
  req: TransactionApiDeleteTransactionRequest,
  res: TransactionApiDeleteTransactionResponse
) => {
  try {
    const { name } = req.params
    await TransactionServiceClient.deleteTransaction(name)
    const { version } = res.locals
    return res.status(200).send({ version, name })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
