import { TransactionServiceClient } from '@mds-core/mds-transactions-service'
import { TransactionOperationDomainModel } from '@mds-core/mds-transactions-service/@types'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiGetTransactionOperationsRequest = TransactionApiRequest

export type TransactionApiGetTransactionOperationsResponse = TransactionApiResponse<{
  operations: TransactionOperationDomainModel[]
}>

export const GetTransactionOperationsHandler = async (
  req: TransactionApiGetTransactionOperationsRequest,
  res: TransactionApiGetTransactionOperationsResponse
) => {
  try {
    const operations = await TransactionServiceClient.getTransactionOperations()
    const { version } = res.locals
    return res.status(200).send({ version, operations })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
