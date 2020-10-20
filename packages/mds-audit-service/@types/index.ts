import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'
import { Nullable, Timestamp, UUID } from '@mds-core/mds-types'

export interface AuditDomainModel {
  audit_trip_id: UUID
  audit_device_id: UUID
  audit_subject_id: string
  provider_id: UUID
  provider_name: string
  provider_vehicle_id: string
  provider_device_id: Nullable<UUID>
  timestamp: Timestamp
}

export type AuditDomainCreateModel = DomainModelCreate<AuditDomainModel>

export interface AuditService {
  name: () => string
}

export const AuditServiceDefinition: RpcServiceDefinition<AuditService> = {
  name: RpcRoute<AuditService['name']>()
}
