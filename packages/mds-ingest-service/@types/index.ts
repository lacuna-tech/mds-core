import { DomainModelCreate } from '@mds-core/mds-repository'
import {
  Nullable,
  PROPULSION_TYPE,
  TelemetryData,
  Timestamp,
  UUID,
  VEHICLE_EVENT,
  VEHICLE_REASON,
  VEHICLE_TYPE,
  WithGpsProperty
} from '@mds-core/mds-types'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'

export interface DeviceDomainModel {
  device_id: UUID
  provider_id: UUID
  vehicle_id: string
  type: VEHICLE_TYPE
  propulsion: PROPULSION_TYPE[]
  recorded: Timestamp

  year: Nullable<number>
  mfgr: Nullable<string>
  model: Nullable<string>
}

export type DeviceDomainCreateModel = DomainModelCreate<DeviceDomainModel>

export interface TelemetryDomainModel extends WithGpsProperty<TelemetryData> {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  recorded: Timestamp
}

export type TelemetryDomainCreateModel = DomainModelCreate<Omit<TelemetryDomainModel, 'recorded'>>

export interface EventDomainModel {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  event_type: VEHICLE_EVENT
  recorded: Timestamp

  event_type_reason: Nullable<VEHICLE_REASON>
  telemetry_timestamp: Nullable<Timestamp>
  telemetry: Nullable<TelemetryDomainModel>
  trip_id: Nullable<UUID>
  service_area_id: Nullable<UUID>
}

export type EventDomainCreateModel = DomainModelCreate<Omit<EventDomainModel, 'recorded'>>

export interface IngestService {
  name: () => string
}

export const IngestServiceDefinition: RpcServiceDefinition<IngestService> = {
  name: RpcRoute<IngestService['name']>()
}
