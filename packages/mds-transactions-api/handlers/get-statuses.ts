import { TransactionServiceClient } from '@mds-core/mds-transactions-service'
import { TransactionStatusDomainModel } from '@mds-core/mds-transactions-service/@types'
import { TransactionApiRequest, TransactionApiResponse } from '../@types'

export type TransactionApiGetTransactionStatusesRequest = TransactionApiRequest

export type TransactionApiGetTransactionStatusesResponse = TransactionApiResponse<{
  statuses: TransactionStatusDomainModel[]
}>

export const GetTransactionStatusesHandler = async (
  req: TransactionApiGetTransactionStatusesRequest,
  res: TransactionApiGetTransactionStatusesResponse
) => {
  try {
    const statuses = await TransactionServiceClient.getTransactionStatuses()
    const { version } = res.locals
    return res.status(200).send({ version, statuses })
  } catch (error) {
    return res.status(500).send({ error })
  }
}
