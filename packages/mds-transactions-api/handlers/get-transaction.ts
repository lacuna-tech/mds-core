import { TransactionServiceClient, TransactionDomainModel } from '@mds-core/mds-transactions-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { TransactionApiResponse, TransactionApiRequest } from '../@types'

export type TransactionApiGetTransactionRequest = TransactionApiRequest & ApiRequestParams<'name'>

export type TransactionApiGetTransactionResponse = TransactionApiResponse<{ transaction: TransactionDomainModel }>

export const GetTransactionHandler = async (
  req: TransactionApiGetTransactionRequest,
  res: TransactionApiGetTransactionResponse
) => {
  try {
    const { name } = req.params
    const transaction = await TransactionServiceClient.getTransaction(name)
    const { version } = res.locals
    return res.status(200).send({ version, transaction })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
    }
    return res.status(404).send({ error })
  }
}
