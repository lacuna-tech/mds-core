import { TransactionServiceClient, TransactionDomainModel } from '@mds-core/mds-transactions-service'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiGetTransactionsRequest = TransactionApiRequest

export type TransactionApiGetTransactionsResponse = TransactionApiResponse<{ transactions: TransactionDomainModel[] }>

export const GetTransactionsHandler = async (
  req: TransactionApiGetTransactionsRequest,
  res: TransactionApiGetTransactionsResponse
) => {
  try {
    const transactions = await TransactionServiceClient.getTransactions()
    const { version } = res.locals
    return res.status(200).send({ version, transactions })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
