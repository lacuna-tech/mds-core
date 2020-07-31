import { Enum } from '@mds-core/mds-types'

// TODO providers are in CSV

const TABLE = Enum(
  'attachments',
  'audit_attachments',
  'audit_events',
  'audits',
  'devices',
  'events',
  'events04', // 0.4 events table is significatly different
  'geographies',
  'geography_metadata',
  'migrations',
  'policies',
  'policy_metadata',
  'stops',
  'telemetry'
)
export type TABLE_NAME = keyof typeof TABLE
const TABLES = Object.keys(TABLE) as TABLE_NAME[]
const DEPRECATED_PROVIDER_TABLES = ['status_changes', 'trips']

const COLUMN = Enum(
  'accuracy',
  'address',
  'altitude',
  'attachment_filename',
  'attachment_id',
  'audit_device_id',
  'audit_event_id',
  'audit_event_type',
  'audit_issue_code',
  'audit_subject_id',
  'audit_trip_id',
  'base_url',
  'capacity',
  'charge',
  'cross_street',
  'deleted',
  'description',
  'device_id',
  'effective_date',
  'end_time',
  'event_type', // deprecated 1.0 for event_types
  'event_types', // new in 1.0
  'event_type_reason', // deprecated 1.0, removed entirely
  'geography_id',
  'geography_json',
  'geography_metadata',
  'heading',
  'id',
  'lat',
  'lng',
  'location_type',
  'mfgr',
  'migration',
  'mimetype',
  'model',
  'name',
  'note',
  'num_spots_available',
  'num_spots_disabled',
  'num_vehicles_available',
  'num_vehicles_disabled',
  'parking_verification_url',
  'platform_code',
  'policy_id',
  'policy_json',
  'policy_metadata',
  'post_code',
  'prev_geographies',
  'propulsion',
  'propulsion_type', // deprecated 1.0 for propulsion_types
  'propulsion_types', // new in 1.0
  'provider_device_id',
  'provider_id',
  'provider_name',
  'provider_vehicle_id',
  'publish_date',
  'recorded',
  'rental_methods',
  'reservation_cost',
  'service_area_id',
  'short_name',
  'speed',
  'stop_id',
  'stop_name',
  'telemetry_timestamp',
  'thumbnail_filename',
  'thumbnail_mimetype',
  'timestamp',
  'timezone',
  'trip_id',
  'type', // deprecated 1.0 for vehicle_type
  'vehicle_state', // new in 1.0
  'vehicle_type', // new in 1.0
  'vehicle_id',
  'wheelchair_boarding',
  'year',
  'zone_id'
)
export type COLUMN_NAME = keyof typeof COLUMN
const COLUMNS = Object.keys(COLUMN) as COLUMN_NAME[]

const TABLE_COLUMNS: { [T in TABLE_NAME]: Readonly<COLUMN_NAME[]> } = {
  [TABLE.attachments]: [
    COLUMN.id,
    COLUMN.attachment_filename,
    COLUMN.attachment_id,
    COLUMN.base_url,
    COLUMN.mimetype,
    COLUMN.thumbnail_filename,
    COLUMN.thumbnail_mimetype,
    COLUMN.recorded
  ],
  [TABLE.audit_attachments]: [COLUMN.id, COLUMN.attachment_id, COLUMN.audit_trip_id, COLUMN.recorded],
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
    // COLUMN.type, // deprecated 1.0
    COLUMN.vehicle_type, // added 1.0
    // COLUMN.propulsion, // deprecated 1.0
    COLUMN.propulsion_types, // added 1.0
    COLUMN.year,
    COLUMN.mfgr,
    COLUMN.model,
    COLUMN.recorded
  ],
  [TABLE.events04]: [
    COLUMN.id,
    COLUMN.device_id,
    COLUMN.provider_id,
    COLUMN.timestamp,
    COLUMN.event_type, // deprecated 1.0
    COLUMN.event_type_reason, // deprecated 1.0
    COLUMN.telemetry_timestamp,
    COLUMN.trip_id,
    COLUMN.service_area_id,
    COLUMN.recorded
  ],
  [TABLE.events]: [
    COLUMN.id,
    COLUMN.device_id,
    COLUMN.provider_id,
    COLUMN.timestamp,
    // COLUMN.event_type, // deprecated 1.0
    COLUMN.event_types, // added 1.0
    // COLUMN.event_type_reason, // deprecated 1.0
    COLUMN.vehicle_state, // added 1.0
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
  ],
  [TABLE.stops]: [
    COLUMN.id,
    COLUMN.stop_id,
    COLUMN.stop_name,
    COLUMN.short_name,
    COLUMN.platform_code,
    COLUMN.geography_id,
    COLUMN.zone_id,
    COLUMN.address,
    COLUMN.post_code,
    COLUMN.rental_methods,
    COLUMN.capacity,
    COLUMN.location_type,
    COLUMN.timezone,
    COLUMN.cross_street,
    COLUMN.num_vehicles_available,
    COLUMN.num_vehicles_disabled,
    COLUMN.num_spots_available,
    COLUMN.num_spots_disabled,
    COLUMN.wheelchair_boarding,
    COLUMN.reservation_cost,
    COLUMN.recorded
  ]
}

const TABLE_KEY: { [T in TABLE_NAME]: COLUMN_NAME[] } = {
  [TABLE.attachments]: [COLUMN.attachment_id],
  [TABLE.audit_attachments]: [COLUMN.attachment_id, COLUMN.audit_trip_id],
  [TABLE.audit_events]: [COLUMN.audit_trip_id, COLUMN.timestamp],
  [TABLE.audits]: [COLUMN.audit_trip_id],
  [TABLE.devices]: [COLUMN.device_id],
  [TABLE.events]: [COLUMN.device_id, COLUMN.timestamp],
  [TABLE.geographies]: [COLUMN.geography_id],
  [TABLE.geography_metadata]: [COLUMN.geography_id],
  [TABLE.migrations]: [COLUMN.migration],
  [TABLE.policies]: [COLUMN.policy_id],
  [TABLE.policy_metadata]: [COLUMN.policy_id],
  [TABLE.stops]: [COLUMN.stop_id],
  [TABLE.telemetry]: [COLUMN.device_id, COLUMN.timestamp]
}

const COLUMN_TYPE: { [C in COLUMN_NAME]: string } = {
  [COLUMN.accuracy]: 'real',
  [COLUMN.address]: 'varchar(255)',
  [COLUMN.altitude]: 'real',
  [COLUMN.attachment_filename]: 'varchar(64) NOT NULL',
  [COLUMN.attachment_id]: 'uuid NOT NULL',
  [COLUMN.audit_device_id]: 'uuid NOT NULL',
  [COLUMN.audit_event_id]: 'uuid NOT NULL',
  [COLUMN.audit_event_type]: 'varchar(31) NOT NULL',
  [COLUMN.audit_issue_code]: 'varchar(31)',
  [COLUMN.audit_subject_id]: 'varchar(255) NOT NULL',
  [COLUMN.audit_trip_id]: 'uuid NOT NULL',
  [COLUMN.base_url]: 'varchar(127) NOT NULL',
  [COLUMN.capacity]: 'jsonb',
  [COLUMN.charge]: 'real',
  [COLUMN.cross_street]: 'varchar(255)',
  [COLUMN.deleted]: 'bigint',
  [COLUMN.description]: 'varchar(255)',
  [COLUMN.device_id]: 'uuid NOT NULL',
  [COLUMN.effective_date]: 'bigint',
  [COLUMN.end_time]: 'bigint',
  [COLUMN.event_type]: 'varchar(31)',
  [COLUMN.event_types]: 'varchar(31)[] NOT NULL',
  [COLUMN.event_type_reason]: 'varchar(31)',
  [COLUMN.geography_id]: 'uuid NOT NULL',
  [COLUMN.geography_json]: 'json NOT NULL',
  [COLUMN.geography_metadata]: 'json',
  [COLUMN.heading]: 'real',
  [COLUMN.id]: 'bigint GENERATED ALWAYS AS IDENTITY',
  [COLUMN.lat]: 'double precision NOT NULL',
  [COLUMN.lng]: 'double precision NOT NULL',
  [COLUMN.location_type]: 'varchar(255)',
  [COLUMN.mfgr]: 'varchar(127)',
  [COLUMN.migration]: 'varchar(255) NOT NULL',
  [COLUMN.mimetype]: 'varchar(255) NOT NULL',
  [COLUMN.model]: 'varchar(127)',
  [COLUMN.name]: 'varchar(255)',
  [COLUMN.note]: 'varchar(255)',
  [COLUMN.num_spots_available]: 'jsonb NOT NULL',
  [COLUMN.num_spots_disabled]: 'jsonb',
  [COLUMN.num_vehicles_available]: 'jsonb NOT NULL',
  [COLUMN.num_vehicles_disabled]: 'jsonb',
  [COLUMN.parking_verification_url]: 'varchar(255)',
  [COLUMN.platform_code]: 'varchar(255)',
  [COLUMN.policy_id]: 'uuid NOT NULL',
  [COLUMN.policy_json]: 'json NOT NULL',
  [COLUMN.policy_metadata]: 'json',
  [COLUMN.post_code]: 'varchar(255)',
  [COLUMN.prev_geographies]: 'uuid[]',
  [COLUMN.propulsion]: 'varchar(31)[] NOT NULL',
  [COLUMN.propulsion_type]: 'varchar(31)[] NOT NULL',
  [COLUMN.propulsion_types]: 'varchar(31)[] NOT NULL',
  [COLUMN.provider_device_id]: 'uuid', // May be null if can't find
  [COLUMN.provider_id]: 'uuid NOT NULL',
  [COLUMN.provider_name]: 'varchar(127) NOT NULL',
  [COLUMN.provider_vehicle_id]: 'varchar(255) NOT NULL',
  [COLUMN.publish_date]: 'bigint',
  [COLUMN.recorded]: 'bigint NOT NULL', // timestamp of when record was created
  [COLUMN.rental_methods]: 'varchar(255)',
  [COLUMN.reservation_cost]: 'jsonb',
  [COLUMN.service_area_id]: 'uuid',
  [COLUMN.short_name]: 'varchar(31)',
  [COLUMN.speed]: 'real',
  [COLUMN.stop_id]: 'uuid NOT NULL',
  [COLUMN.stop_name]: 'varchar(255) NOT NULL',
  [COLUMN.telemetry_timestamp]: 'bigint',
  [COLUMN.thumbnail_filename]: 'varchar(64)',
  [COLUMN.thumbnail_mimetype]: 'varchar(64)',
  [COLUMN.timestamp]: 'bigint NOT NULL',
  [COLUMN.timezone]: 'varchar(255)',
  [COLUMN.trip_id]: 'uuid',
  [COLUMN.type]: 'varchar(31) NOT NULL',
  [COLUMN.vehicle_id]: 'varchar(255) NOT NULL',
  [COLUMN.vehicle_state]: 'varchar(31) NOT NULL',
  [COLUMN.vehicle_type]: 'varchar(31) NOT NULL',
  [COLUMN.wheelchair_boarding]: 'bool DEFAULT FALSE',
  [COLUMN.year]: 'smallint',
  [COLUMN.zone_id]: 'varchar(255)'
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
