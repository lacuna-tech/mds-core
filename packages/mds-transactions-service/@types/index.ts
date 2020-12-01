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
  created: Timestamp // could be any time before the Transaction 'created'
  origin_url: URL // where can I go to dig into the details of the receipt, given this receipt_id?
  receipt_details: Object // JSON blob with free-form supporting evidence, DO NOT INCLUDE PII
}

export interface TransactionDomainModel {
  transaction_id: UUID
  provider_id: UUID
  device_id: Nullable<UUID> // optional
  created: Timestamp
  fee_type: FEE_TYPE
  amount: Number // pennies
  receipt: ReceiptDomainModel // is this how you specify a JSON blob?
}

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
  created: Timestamp
  operation_type: TRANSACTION_OPERATION_TYPE
  // who made this change
  author: string
}
export type TransactionDomainCreateModel = DomainModelCreate<TransactionDomainModel>

export const TRANSACTION_STATUS_TYPES = [
  'order_submitted',
  'order_canceled',
  'order_complete',
  'order_incomplete'
] as const

export type TRANSACTION_STATUS_TYPE = typeof TRANSACTION_STATUS_TYPES[number]

export interface TransactionStatusDomainModel {
  status_id: UUID
  transaction_id: UUID
  // when was this change made
  created: Timestamp
  status_type: TRANSACTION_OPERATION_TYPE
  // who made this change
  author: string
}
export type TransactionStatusCreateModel = DomainModelCreate<TransactionDomainModel>

export interface TransactionService {
  createTransactions: (transactions: TransactionDomainCreateModel[]) => TransactionDomainModel[]
  createTransaction: (transaction: TransactionDomainCreateModel) => TransactionDomainModel
  getTransactions: () => TransactionDomainModel[]
  getTransaction: (transaction_id: TransactionDomainModel['transaction_id']) => TransactionDomainModel
  updateTransaction: (transaction: TransactionDomainModel) => TransactionDomainModel
  deleteTransaction: (id: UUID) => TransactionDomainModel['transaction_id']
}

export const TransactionServiceDefinition: RpcServiceDefinition<TransactionService> = {
  createTransactions: RpcRoute<TransactionService['createTransactions']>(),
  createTransaction: RpcRoute<TransactionService['createTransaction']>(),
  getTransactions: RpcRoute<TransactionService['getTransactions']>(),
  getTransaction: RpcRoute<TransactionService['getTransaction']>(),
  updateTransaction: RpcRoute<TransactionService['updateTransaction']>(),
  deleteTransaction: RpcRoute<TransactionService['deleteTransaction']>()
}
