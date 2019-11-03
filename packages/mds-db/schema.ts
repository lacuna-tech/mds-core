import { Enum } from '@mds-core/mds-types'

// TODO providers are in CSV

const TABLE = Enum(
  'audit_events',
  'audits',
  'devices',
  'events',
  'geographies',
  'geography_metadata',
  'migrations',
  'policies',
  'policy_metadata',
  'telemetry'
)
export type TABLE_NAME = keyof typeof TABLE
const TABLES = Object.keys(TABLE) as TABLE_NAME[]
const DEPRECATED_PROVIDER_TABLES = ['status_changes', 'trips']

const COLUMN = Enum(
  'accuracy',
  'altitude',
  'audit_device_id',
  'audit_event_id',
  'audit_event_type',
  'audit_issue_code',
  'audit_subject_id',
  'audit_trip_id',
  'charge',
  'deleted',
  'description',
  'device_id',
  'effective_date',
  'event_type_reason',
  'event_type',
  'geography_id',
  'geography_json',
  'geography_metadata',
  'heading',
  'id',
  'lat',
  'lng',
  'migration',
  'mfgr',
  'model',
  'name',
  'note',
  'policy_id',
  'policy_json',
  'policy_metadata',
  'prev_geographies',
  'propulsion_type',
  'propulsion',
  'provider_device_id',
  'provider_id',
  'provider_name',
  'provider_vehicle_id',
  'publish_date',
  'recorded',
  'service_area_id',
  'speed',
  'telemetry_timestamp',
  'timestamp',
  'trip_id',
  'type',
  'vehicle_id',
  'vehicle_type',
  'year'
)
export type COLUMN_NAME = keyof typeof COLUMN
const COLUMNS = Object.keys(COLUMN) as COLUMN_NAME[]

const TABLE_COLUMNS: { [T in TABLE_NAME]: Readonly<COLUMN_NAME[]> } = {
  [TABLE.audits]: [
    COLUMN.id,
    COLUMN.audit_trip_id,
    COLUMN.audit_device_id,
    COLUMN.audit_subject_id,
    COLUMN.provider_id,
    COLUMN.provider_name,
    COLUMN.provider_vehicle_id,
    COLUMN.provider_device_id,
    COLUMN.timestamp,
    COLUMN.deleted,
    COLUMN.recorded
  ],
  [TABLE.audit_events]: [
    COLUMN.id,
    COLUMN.audit_trip_id,
    COLUMN.audit_event_id,
    COLUMN.audit_event_type,
    COLUMN.audit_issue_code,
    COLUMN.audit_subject_id,
    COLUMN.note,
    COLUMN.timestamp,
    COLUMN.lat,
    COLUMN.lng,
    COLUMN.speed,
    COLUMN.heading,
    COLUMN.accuracy,
    COLUMN.altitude,
    COLUMN.charge,
    COLUMN.recorded
  ],
  [TABLE.devices]: [
    COLUMN.id,
    COLUMN.device_id,
    COLUMN.provider_id,
    COLUMN.vehicle_id,
    COLUMN.type,
    COLUMN.propulsion,
    COLUMN.year,
    COLUMN.mfgr,
    COLUMN.model,
    COLUMN.recorded
  ],
  [TABLE.events]: [
    COLUMN.id,
    COLUMN.device_id,
    COLUMN.provider_id,
    COLUMN.timestamp,
    COLUMN.event_type,
    COLUMN.event_type_reason,
    COLUMN.telemetry_timestamp,
    COLUMN.trip_id,
    COLUMN.service_area_id,
    COLUMN.recorded
  ],
  [TABLE.geographies]: [
    COLUMN.id,
    COLUMN.description,
    COLUMN.effective_date,
    COLUMN.geography_id,
    COLUMN.geography_json,
    COLUMN.publish_date,
    COLUMN.prev_geographies,
    COLUMN.name
  ],
  [TABLE.geography_metadata]: [COLUMN.id, COLUMN.geography_id, COLUMN.geography_metadata],
  [TABLE.migrations]: [COLUMN.id, COLUMN.migration, COLUMN.timestamp],
  [TABLE.policies]: [COLUMN.id, COLUMN.policy_id, COLUMN.policy_json],
  [TABLE.policy_metadata]: [COLUMN.id, COLUMN.policy_id, COLUMN.policy_metadata],
  [TABLE.telemetry]: [
    COLUMN.id,
    COLUMN.device_id,
    COLUMN.provider_id,
    COLUMN.timestamp,
    COLUMN.lat,
    COLUMN.lng,
    COLUMN.speed,
    COLUMN.heading,
    COLUMN.accuracy,
    COLUMN.altitude,
    COLUMN.charge,
    COLUMN.recorded
  ]
}

const TABLE_KEY: { [T in TABLE_NAME]: COLUMN_NAME[] } = {
  [TABLE.audits]: [COLUMN.audit_trip_id],
  [TABLE.audit_events]: [COLUMN.audit_trip_id, COLUMN.timestamp],
  [TABLE.devices]: [COLUMN.device_id],
  [TABLE.events]: [COLUMN.device_id, COLUMN.timestamp],
  [TABLE.geographies]: [COLUMN.geography_id],
  [TABLE.geography_metadata]: [COLUMN.geography_id],
  [TABLE.migrations]: [COLUMN.migration],
  [TABLE.policies]: [COLUMN.policy_id],
  [TABLE.policy_metadata]: [COLUMN.policy_id],
  [TABLE.telemetry]: [COLUMN.device_id, COLUMN.timestamp]
}

const COLUMN_TYPE: { [C in COLUMN_NAME]: string } = {
  [COLUMN.accuracy]: 'real',
  [COLUMN.altitude]: 'real',
  [COLUMN.audit_device_id]: 'uuid NOT NULL',
  [COLUMN.audit_event_id]: 'uuid NOT NULL',
  [COLUMN.audit_event_type]: 'varchar(31) NOT NULL',
  [COLUMN.audit_issue_code]: 'varchar(31)',
  [COLUMN.audit_subject_id]: 'varchar(255) NOT NULL',
  [COLUMN.audit_trip_id]: 'uuid NOT NULL',
  [COLUMN.charge]: 'real',
  [COLUMN.deleted]: 'bigint',
  [COLUMN.description]: 'varchar(255)',
  [COLUMN.device_id]: 'uuid NOT NULL',
  [COLUMN.effective_date]: 'bigint',
  [COLUMN.event_type_reason]: 'varchar(31)',
  [COLUMN.event_type]: 'varchar(31) NOT NULL',
  [COLUMN.geography_id]: 'uuid NOT NULL',
  [COLUMN.geography_json]: 'json NOT NULL',
  [COLUMN.geography_metadata]: 'json',
  [COLUMN.heading]: 'real',
  [COLUMN.id]: 'bigint GENERATED ALWAYS AS IDENTITY',
  [COLUMN.lat]: 'double precision NOT NULL',
  [COLUMN.lng]: 'double precision NOT NULL',
  [COLUMN.migration]: 'varchar(255) NOT NULL',
  [COLUMN.mfgr]: 'varchar(127)',
  [COLUMN.model]: 'varchar(127)',
  [COLUMN.name]: 'varchar(255)',
  [COLUMN.note]: 'varchar(255)',
  [COLUMN.policy_id]: 'uuid NOT NULL',
  [COLUMN.policy_json]: 'json NOT NULL',
  [COLUMN.policy_metadata]: 'json',
  [COLUMN.publish_date]: 'bigint',
  [COLUMN.prev_geographies]: 'uuid[]',
  [COLUMN.propulsion_type]: 'varchar(31)[] NOT NULL',
  [COLUMN.propulsion]: 'varchar(31)[] NOT NULL',
  [COLUMN.provider_device_id]: 'uuid', // May be null if can't find
  [COLUMN.provider_id]: 'uuid NOT NULL',
  [COLUMN.provider_name]: 'varchar(127) NOT NULL',
  [COLUMN.provider_vehicle_id]: 'varchar(255) NOT NULL',
  [COLUMN.recorded]: 'bigint NOT NULL', // timestamp of when record was created
  [COLUMN.service_area_id]: 'uuid',
  [COLUMN.speed]: 'real',
  [COLUMN.telemetry_timestamp]: 'bigint',
  [COLUMN.timestamp]: 'bigint NOT NULL',
  [COLUMN.trip_id]: 'uuid',
  [COLUMN.type]: 'varchar(31) NOT NULL',
  [COLUMN.vehicle_id]: 'varchar(255) NOT NULL',
  [COLUMN.vehicle_type]: 'varchar(31) NOT NULL',
  [COLUMN.year]: 'smallint'
}

export default {
  COLUMN,
  COLUMNS,
  COLUMN_TYPE,
  DEPRECATED_PROVIDER_TABLES,
  TABLE,
  TABLES,
  TABLE_COLUMNS,
  TABLE_KEY
}
