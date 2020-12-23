import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'
import { Nullable, Timestamp, UUID, VEHICLE_TYPE, VehicleEvent } from '@mds-core/mds-types'

// one example -- many others are possible
export interface TripReceiptDetailsDomainModel {
  trip_id: UUID
  start_timestamp: Timestamp
  end_timestamp: Timestamp
  vehicle_type: VEHICLE_TYPE
  start_geography_id: Nullable<UUID>
  end_geography_id: Nullable<UUID>
  duration: Number // seconds
  distance: Number // meters
  trip_events: VehicleEvent[]
}

export interface CurbUseDetailsDomainModel {
  trip_id: UUID
  start_timestamp: Timestamp
  end_timestamp: Timestamp
  vehicle_type: VEHICLE_TYPE
  geography_id: Nullable<UUID>
  duration: Number // seconds
  trip_events: VehicleEvent[]
}

export const FEE_TYPES = [
  'base_fee',
  'upgrade_fee',
  'congestion_fee',
  'trip_fee',
  'parking_fee',
  'reservation_fee',
  'distance_fee',
  'tolls_fee'
] as const

export type FEE_TYPE = typeof FEE_TYPES[number]

export interface ReceiptDomainModel {
  receipt_id: UUID
  timestamp: Timestamp // could be any time before the Transaction was created
  origin_url: string // where can I go to dig into the details of the receipt, given this receipt_id?
  receipt_details: TripReceiptDetailsDomainModel | CurbUseDetailsDomainModel | Object // JSON blob with free-form supporting evidence, DO NOT INCLUDE PII
}

export interface TransactionDomainModel {
  transaction_id: UUID
  provider_id: UUID
  device_id: Nullable<UUID> // optional
  timestamp: Timestamp
  fee_type: FEE_TYPE
  amount: Number // pennies
  receipt: ReceiptDomainModel // JSON blob
}
export type TransactionDomainCreateModel = DomainModelCreate<TransactionDomainModel>

export const TRANSACTION_OPERATION_TYPES = [
  'transaction_posted',
  'invoice_generated',
  'dispute_requested',
  'dispute_approved',
  'dispute_declined',
  'dispute_canceled'
] as const

export type TRANSACTION_OPERATION_TYPE = typeof TRANSACTION_OPERATION_TYPES[number]

export interface TransactionOperationDomainModel {
  operation_id: UUID
  transaction_id: UUID
  // when was this change made
  timestamp: Timestamp
  operation_type: TRANSACTION_OPERATION_TYPE
  // who made this change (TODO work out authorship representation; could be human, could be api, etc.)
  author: string
}
export type TransactionOperationDomainCreateModel = DomainModelCreate<TransactionOperationDomainModel>

export const TRANSACTION_STATUS_TYPES = [
  'order_submitted',
  'order_canceled',
  'order_complete',
  'order_incomplete'
] as const

export type TRANSACTION_STATUS_TYPE = typeof TRANSACTION_STATUS_TYPES[number]

export interface TransactionSearchParams {
  provider_id?: UUID
  start_timestamp?: Timestamp
  end_timestamp?: Timestamp
}

export interface TransactionStatusDomainModel {
  status_id: UUID
  transaction_id: UUID
  // when was this change made
  timestamp: Timestamp
  status_type: TRANSACTION_OPERATION_TYPE
  // who made this change (TODO work out authorship representation; could be human, could be api, etc.)
  author: string
}
export type TransactionStatusDomainCreateModel = DomainModelCreate<TransactionStatusDomainModel>

export interface TransactionService {
  /**  if auth token has a provider_id, it must match */
  createTransaction: (transaction: TransactionDomainCreateModel) => TransactionDomainModel
  /**  if auth token has a provider_id, it must match */
  createTransactions: (transactions: TransactionDomainCreateModel[]) => TransactionDomainModel[]

  // if auth token has a provider_id, it must match
  // read-back bulk TODO search criteria
  getTransactions: (params: TransactionSearchParams) => TransactionDomainModel[]
  // if auth token has a provider_id, it must match
  // read back single
  getTransaction: (transaction_id: TransactionDomainModel['transaction_id']) => TransactionDomainModel

  /** create an 'operation', e.g. for dispute-handling, etc. */
  addTransactionOperation: (operation: TransactionOperationDomainCreateModel) => TransactionOperationDomainModel
  /** read back operations for a transaction */
  // if auth token has a provider_id, it must match the provider_id in the transaction
  getTransactionOperations: (
    transaction_id: TransactionDomainModel['transaction_id']
  ) => TransactionOperationDomainModel[]

  // get all the status changes for this transaction (typically we won't have a ton I expect)
  // if auth token has a provider_id, it must match the provider_id in the transaction
  getTransactionStatuses: (transaction_id: TransactionDomainModel['transaction_id']) => TransactionStatusDomainModel[]
  // add a new status change
  setTransactionStatus: (status: TransactionStatusDomainCreateModel) => TransactionStatusDomainModel
}

export const TransactionServiceDefinition: RpcServiceDefinition<TransactionService> = {
  createTransaction: RpcRoute<TransactionService['createTransaction']>(),
  createTransactions: RpcRoute<TransactionService['createTransactions']>(),

  getTransactions: RpcRoute<TransactionService['getTransactions']>(),
  getTransaction: RpcRoute<TransactionService['getTransaction']>(),

  addTransactionOperation: RpcRoute<TransactionService['addTransactionOperation']>(),
  getTransactionOperations: RpcRoute<TransactionService['getTransactionOperations']>(),

  getTransactionStatuses: RpcRoute<TransactionService['getTransactionStatuses']>(),
  setTransactionStatus: RpcRoute<TransactionService['setTransactionStatus']>()
}
