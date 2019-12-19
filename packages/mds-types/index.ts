/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */
import { FeatureCollection } from 'geojson'

export { AccessTokenScope, AccessTokenScopes, ScopeDescriptions } from './scopes'

export const Enum = <T extends string>(...keys: T[]) =>
  Object.freeze(
    keys.reduce((e, key) => {
      return { ...e, [key]: key }
    }, {}) as { [K in T]: K }
  )

export const isEnum = (enums: { [key: string]: string }, value: unknown) =>
  typeof value === 'string' && typeof enums === 'object' && enums[value] === value

export const VEHICLE_TYPES = Enum('car', 'bicycle', 'scooter', 'moped', 'recumbent')
export type VEHICLE_TYPE = keyof typeof VEHICLE_TYPES

export const RULE_TYPES = Enum('count', 'speed', 'time', 'user')
export type RULE_TYPE = keyof typeof RULE_TYPES

export const RULE_UNIT_MAP = {
  minutes: 60,
  hours: 60 * 60
}

// Event Streaming
export interface StateEntry {
  vehicle_type: VEHICLE_TYPE
  type: string
  timestamp: Timestamp
  device_id: UUID
  provider_id: UUID
  recorded: Timestamp
  annotation_version: number
  annotation: AnnotationData | null
  gps?: GpsData | null
  service_area_id?: UUID | null // telemetry entries will be null
  charge?: number | null
  state: VEHICLE_STATUS | null // telemetry entries will be null
  event_type: VEHICLE_EVENT | null // telemetry entries will be null
  event_type_reason?: VEHICLE_REASON | null // telemetry entries will be null
  trip_id?: UUID | null // telemetry entries will be null
}

export interface AnnotationData {
  in_bound: boolean
  /* eslint-reason TODO: areas have not been defined yet within the scope of MJ */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  areas: any
}

export interface TripEvent {
  vehicle_type: VEHICLE_TYPE
  timestamp: Timestamp
  event_type: VEHICLE_EVENT | null // telemetry entries will be null
  event_type_reason?: VEHICLE_REASON | null
  annotation_version: number
  annotation: AnnotationData | null
  gps?: GpsData | null
  service_area_id?: UUID | null
}

export type TripsEvents = { [trip_id: string]: TripEvent[] }

export interface TripTelemetry {
  timestamp: Timestamp
  latitude: number | null
  longitude: number | null
  annotation_version: number
  annotation: AnnotationData | null
  service_area_id?: UUID | null
}

export type TripsTelemetry = { [trip_id: string]: TripTelemetry[] }

export interface TripEntry {
  vehicle_type: VEHICLE_TYPE
  trip_id: UUID
  device_id: UUID
  provider_id: UUID
  recorded: Timestamp
  start_time: Timestamp
  end_time: Timestamp
  start_service_area_id?: UUID | null
  end_service_area_id?: UUID | null
  duration: number // in milliseconds
  distance: number | null // default in miles
  violation_count: number
  max_violation_dist: number | null
  min_violation_dist: number | null
  avg_violation_dist: number | null
  events: TripEvent[]
  telemetry: TripTelemetry[][]
}

export interface ProviderStreamData {
  invalidEvents: StateEntry[]
  duplicateEvents: StateEntry[]
  outOfOrderEvents: StateEntry[]
}

export interface MetricCount {
  count: number
  min: number | null
  max: number | null
  average: number | null
}
export interface LateMetricObj {
  /** Number of trip_start and trip_end events out of compliance with time SLA. */
  start_end: MetricCount
  /** Number of trip_enter and trip_leave events out of compliance with time SLA. */
  enter_leave: MetricCount
  /** Number of telemetry events out of compliance with time SLA. */
  telemetry: MetricCount
}

export interface VehicleCountMetricObj {
  /** Total number of registered vehicles at start of bin. */
  registered: number | null
  /** Total number of vehicles in the right-of-way at start of bin (available, reserved, trip). */
  deployed: number | null
  /** Number of vehicles in the right-of-way with 0 charge at start of bin. */
  dead: number | null
}

export interface MetricsTableRow {
  recorded: Timestamp
  /** Timestamp for start of bin (currently houry bins). */
  start_time: Timestamp
  /** Bin size. */
  bin_size: 'hour' | 'day'
  /** Geography this row applies to.  `null` = the entire organization. */
  geography: null | string // TODO: May be geography 'name', may be 'id'. ???
  /** Serice provider id */
  provider_id: UUID
  /** Vehicle type. */
  vehicle_type: VEHICLE_TYPE
  /** Number of events registered within the bin, by type. */
  event_counts: { [S in VEHICLE_METRIC_EVENT]: number }
  vehicle_counts: VehicleCountMetricObj
  /** Number of trips in region, derived from distinct trip ids. */
  trip_count: number
  /** Number of vehicles with: {0 trips:count, 1 trip:count, 2 trips:count, ...] during bin. */
  vehicle_trips_count: { [x: number]: number } | null
  /** Number of events which out of compliance with time SLA. */
  // TODO:  break into object with this binning, other event types not important. (?)
  event_time_violations: LateMetricObj
  /** Number of telemetry events out of compliance with distance SLA. */
  telemetry_distance_violations: MetricCount
  /** Number of event anomalies. */
  // TODO:  break into object like so
  bad_events: {
    /** Number of invalid events (not matching event state machine). */
    invalid_count: number | null
    /** Number of duplicate events submitted. */
    duplicate_count: number | null
    /** Number of out-of-order events submitted (according to state machine). */
    out_of_order_count: number | null
  }
  /** SLA values used in these calculations, as of start of bin. */
  // TODO:  break into object like so:
  sla: {
    /** Maximum number of deployed vehicles for provider. Comes from Policy rules. */
    // Typical SLA: 500-2000 vehicles
    max_vehicle_cap: number
    /** Minimum number of registered vehicles for provider. */
    // Typical SLA: 100 vehicles
    min_registered: number
    /** Minumum number of trip_start events. */
    // Typical SLA: 100 events???
    // TODO: per day???
    min_trip_start_count: number
    /** Minumum number of trip_end events. */
    // Typical SLA: 100 events???
    // TODO: per day???
    min_trip_end_count: number
    /** Minumum number of telemetry events. */
    // Typical SLA: 1000 events???
    // TODO: per day???
    min_telemetry_count: number
    /** Maximum time between trip_start or trip_end event and submission to server. */
    // Typical SLA: 30 seconds
    // TODO: per day???
    max_start_end_time: number
    /** Maximum time between trip_enter or trip_leave event and submission to server. */
    // Typical SLA: 30 seconds
    max_enter_leave_time: number
    /** Maximum time between telemetry event and submission to server. */
    // Typical SLA: 1680 seconds
    max_telemetry_time: number
    /** Maximum distance between telemetry events when on-trip. */
    // Typical SLA: 100 meters
    max_telemetry_distance: number
  }
}

export const PROPULSION_TYPES = Enum('human', 'electric', 'electric_assist', 'hybrid', 'combustion')
export type PROPULSION_TYPE = keyof typeof PROPULSION_TYPES

export const VEHICLE_STATUSES = Enum('available', 'reserved', 'unavailable', 'removed', 'inactive', 'trip', 'elsewhere')
export type VEHICLE_STATUS = keyof typeof VEHICLE_STATUSES

export const RIGHT_OF_WAY_STATUSES = ['available', 'reserved', 'unavailable', 'trip']

export const VEHICLE_EVENTS = Enum(
  'register',
  'service_start',
  'service_end',
  'provider_drop_off',
  'provider_pick_up',
  'agency_pick_up',
  'agency_drop_off',
  'reserve',
  'cancel_reservation',
  'trip_start',
  'trip_enter',
  'trip_leave',
  'trip_end',
  'deregister'
)

export const VEHICLE_METRIC_EVENTS = { ...VEHICLE_EVENTS, telemetry: 'telemetry' }

export type VEHICLE_EVENT = keyof typeof VEHICLE_EVENTS

export type VEHICLE_METRIC_EVENT = keyof typeof VEHICLE_METRIC_EVENTS

export const VEHICLE_REASONS = Enum(
  'battery_charged',
  'charge',
  'compliance',
  'decommissioned',
  'low_battery',
  'maintenance',
  'missing',
  'off_hours',
  'rebalance'
)
export type VEHICLE_REASON = keyof typeof VEHICLE_REASONS

export const PROVIDER_EVENTS = Enum('available', 'reserved', 'unavailable', 'removed')
export type PROVIDER_EVENT = keyof typeof PROVIDER_EVENTS

export const PROVIDER_REASONS = Enum(
  'service_start',
  'user_drop_off',
  'rebalance_drop_off',
  'maintenance_drop_off',
  'agency_drop_off',
  'user_pick_up',
  'maintenance',
  'low_battery',
  'service_end',
  'rebalance_pick_up',
  'maintenance_pick_up',
  'agency_pick_up'
)
export type PROVIDER_REASON = keyof typeof PROVIDER_REASONS

export const AUDIT_EVENT_TYPES = Enum('start', 'note', 'summary', 'issue', 'telemetry', 'end')
export type AUDIT_EVENT_TYPE = keyof typeof AUDIT_EVENT_TYPES

export const EVENT_STATUS_MAP: { [P in VEHICLE_EVENT]: VEHICLE_STATUS } = {
  register: VEHICLE_STATUSES.removed,
  service_start: VEHICLE_STATUSES.available,
  service_end: VEHICLE_STATUSES.unavailable,
  provider_drop_off: VEHICLE_STATUSES.available,
  provider_pick_up: VEHICLE_STATUSES.removed,
  agency_pick_up: VEHICLE_STATUSES.removed,
  agency_drop_off: VEHICLE_STATUSES.available,
  reserve: VEHICLE_STATUSES.reserved,
  cancel_reservation: VEHICLE_STATUSES.available,
  trip_start: VEHICLE_STATUSES.trip,
  trip_enter: VEHICLE_STATUSES.trip,
  trip_leave: VEHICLE_STATUSES.elsewhere,
  trip_end: VEHICLE_STATUSES.available,
  deregister: VEHICLE_STATUSES.inactive
}

const StatusEventMap = <T extends { [S in VEHICLE_STATUS]: Partial<typeof VEHICLE_EVENTS> }>(map: T) => map

export const STATUS_EVENT_MAP = StatusEventMap({
  available: Enum(
    VEHICLE_EVENTS.service_start,
    VEHICLE_EVENTS.provider_drop_off,
    VEHICLE_EVENTS.cancel_reservation,
    VEHICLE_EVENTS.agency_drop_off
  ),
  reserved: Enum(VEHICLE_EVENTS.reserve),
  unavailable: Enum(VEHICLE_EVENTS.service_end, VEHICLE_EVENTS.trip_end),
  trip: Enum(VEHICLE_EVENTS.trip_start, VEHICLE_EVENTS.trip_enter),
  elsewhere: Enum(VEHICLE_EVENTS.trip_leave),
  removed: Enum(VEHICLE_EVENTS.register, VEHICLE_EVENTS.provider_pick_up, VEHICLE_EVENTS.agency_pick_up),
  inactive: Enum(VEHICLE_EVENTS.deregister)
})

export const DAYS_OF_WEEK = Enum('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat')
export type DAY_OF_WEEK = keyof typeof DAYS_OF_WEEK
export const TIME_FORMAT = 'HH:mm:ss'

/**
 * @format uuid
 * @title A UUID used to uniquely identifty an object
 * @examples ["3c9604d6-b5ee-11e8-96f8-529269fb1459"]
 * @pattern ^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$
 */
export type UUID = string

export type Timestamp = number
export type Stringify<T> = { [P in keyof T]: string }

// Represents a row in the "devices" table
export interface Device {
  device_id: UUID
  provider_id: UUID
  vehicle_id: string
  type: VEHICLE_TYPE
  propulsion: PROPULSION_TYPE[]
  year?: number | null
  mfgr?: string | null
  model?: string | null
  recorded: Timestamp
  status?: VEHICLE_STATUS | null
}

export type DeviceID = Pick<Device, 'provider_id' | 'device_id'>

// Represents a row in the "events" table
// Named "VehicleEvent" to avoid confusion with the DOM's Event interface
export interface VehicleEvent {
  device_id: UUID
  provider_id: UUID
  timestamp: Timestamp
  timestamp_long?: string | null
  delta?: Timestamp | null
  event_type: VEHICLE_EVENT
  event_type_reason?: VEHICLE_REASON | null
  telemetry_timestamp?: Timestamp | null
  telemetry?: Telemetry | null
  trip_id?: UUID | null
  service_area_id?: UUID | null
  recorded: Timestamp
}

// Standard telemetry columns (used in more than one table)
export interface TelemetryData {
  lat: number
  lng: number
  speed?: number | null
  heading?: number | null
  accuracy?: number | null
  hdop?: number | null
  altitude?: number | null
  satellites?: number | null
  charge?: number | null
}

export type GpsData = Omit<TelemetryData, 'charge'>

// While telemetry data is stored in a flattened format, when passed as a parameter it has
// a different shape: { gps: { lat, lng, speed, heading, accurace, altitude } charge }. This
// type alias defines the parameter shape using the types of the underlying flattened data.

export type WithGpsProperty<T extends TelemetryData> = Omit<T, keyof Omit<TelemetryData, 'charge'>> & {
  gps: Omit<TelemetryData, 'charge'>
}

export interface Telemetry extends WithGpsProperty<TelemetryData> {
  provider_id: UUID
  device_id: UUID
  timestamp: Timestamp
  recorded?: Timestamp
}

// Represents a row in the "attachments" table
export interface Attachment {
  attachment_filename: string
  attachment_id: UUID
  base_url: string
  mimetype: string
  thumbnail_filename?: string | null
  thumbnail_mimetype?: string | null
  recorded?: Timestamp | null
}

export interface AttachmentSummary {
  attachment_id: UUID
  attachment_url: string
  thumbnail_url?: string | null
}

// Represents a row in the "audits" table
export interface Audit {
  audit_trip_id: UUID
  audit_device_id: UUID
  audit_subject_id: string
  provider_id: UUID
  provider_name: string
  provider_vehicle_id: string
  provider_device_id: UUID | null
  timestamp: Timestamp
  recorded: Timestamp
}

// Represents a row in the "audit_attachments" table
export interface AuditAttachment {
  attachment_id: UUID
  audit_trip_id: UUID
  recorded: Timestamp
}

// Represents a row in the "audit_events" table
export interface AuditEvent extends TelemetryData {
  audit_trip_id: UUID
  audit_event_id: UUID
  audit_event_type: AUDIT_EVENT_TYPE | VEHICLE_EVENT
  audit_issue_code?: string | null
  audit_subject_id: string
  note?: string | null
  timestamp: Timestamp
  recorded: Timestamp
}

export interface AuditDetails extends Audit {
  events: WithGpsProperty<AuditEvent>[]
  provider_event_type?: string | null
  provider_event_type_reason?: string | null
  provider_status?: string | null
  provider_telemetry?: Telemetry | null
  provider_event_time?: Timestamp | null
  attachments: AttachmentSummary[]
  provider: null | {
    device: Device
    events: VehicleEvent[]
    telemetry: Telemetry[]
  }
}

interface BaseRule<RuleType = 'count' | 'speed' | 'time'> {
  name: string
  rule_id: UUID
  geographies: UUID[]
  statuses: Partial<{ [S in VEHICLE_STATUS]: (keyof typeof STATUS_EVENT_MAP[S])[] | [] }> | null
  rule_type: RuleType
  vehicle_types?: VEHICLE_TYPE[] | null
  maximum?: number | null
  minimum?: number | null
  start_time?: string | null
  end_time?: string | null
  days?: DAY_OF_WEEK[] | null
  /* eslint-reason TODO: message types haven't been defined well yet */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  messages?: any
  value_url?: URL | null
}

export type CountRule = BaseRule<'count'>

export interface TimeRule extends BaseRule<'time'> {
  rule_units: 'minutes' | 'hours'
}

export interface SpeedRule extends BaseRule<'speed'> {
  rule_units: 'kph' | 'mph'
}

export type Rule = CountRule | TimeRule | SpeedRule

export interface Policy {
  name: string
  description: string
  provider_ids?: UUID[]
  published_date?: Timestamp
  policy_id: UUID
  start_date: Timestamp
  end_date: Timestamp | null
  prev_policies: UUID[] | null
  rules: Rule[]
  publish_date?: Timestamp
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PolicyMetadata {
  policy_id: UUID
  policy_metadata: Record<string, any>
}

export interface MatchedVehicle {
  device_id: UUID
  provider_id: UUID
  vehicle_id: string
  vehicle_type: VEHICLE_TYPE
  vehicle_status: VEHICLE_STATUS
  gps: {
    lat: number
    lng: number
  }
}

export interface CountMatch {
  measured: number
  geography_id: UUID
  matched_vehicles: MatchedVehicle[]
}

export interface TimeMatch {
  measured: number
  geography_id: UUID
  matched_vehicle: MatchedVehicle
}

export interface SpeedMatch {
  measured: number
  geography_id: UUID
  matched_vehicle: MatchedVehicle
}

export interface ReducedMatch {
  measured: number
  geography_id: UUID
}

export interface Compliance {
  rule: Rule
  matches: ReducedMatch[] | CountMatch[] | TimeMatch[] | SpeedMatch[]
}

export interface ComplianceResponse {
  policy: Policy
  compliance: Compliance[]
  total_violations: number
  vehicles_in_violation: { device_id: UUID; rule_id: UUID }[]
}

// We don't put the publish_date into the geography_json column
// as we do with the Policy type, because we don't want to mess with
// the geojson FeatureCollection type.
export interface Geography {
  geography_id: UUID
  geography_json: FeatureCollection
  prev_geographies?: UUID[]
  name: string
  publish_date?: Timestamp
  effective_date?: Timestamp
  description?: string
}

export type GeographySummary = Omit<Geography, 'geography_json'>

export interface GeographyMetadata {
  geography_id: UUID
  geography_metadata: Record<string, any>
}

export interface ErrorObject {
  error: string
  error_description: string
}

export interface CountMap {
  [P: string]: number
}

export interface TripsStats {
  single: number
  singles: CountMap
  mysteries: CountMap
  mystery_examples: { [key: string]: UUID[] }
}

// The above types represent objects that can be created and passed into functions that write to the database. The
// following type alias allows wrapping the above types with Recorded<> in order to represent what is read from the
// database. This type alias will add the identity column, add the readonly attribute to all properties, and also
// remove undefined as a valid value since the database will never return undefined.
export type Recorded<T> = Readonly<Required<T & { id: number }>>

export interface BBox {
  latMin: number
  latMax: number
  lngMin: number
  lngMax: number
}
export type BoundingBox = [[number, number], [number, number]]

export interface Provider {
  provider_id: UUID
  provider_name: string
  url?: string
  mds_api_url?: string
  gbfs_api_url?: string
}

export interface Stop {
  stop_id: UUID
  stop_name: string
  short_name?: string
  platform_code?: string
  geography_id?: UUID
  lat: number
  lng: number
  zone_id?: UUID
  address?: string
  post_code?: string
  rental_methods?: string // TOOD: enum?
  capacity: Partial<{ [S in VEHICLE_TYPE]: number }>
  location_type?: string // TODO: enum?
  timezone?: string
  cross_street?: string
  num_vehicles_available: Partial<{ [S in VEHICLE_TYPE]: number }>
  num_vehicles_disabled?: Partial<{ [S in VEHICLE_TYPE]: number }>
  num_spots_available: Partial<{ [S in VEHICLE_TYPE]: number }>
  num_spots_disabled?: Partial<{ [S in VEHICLE_TYPE]: number }>
  wheelchair_boarding?: boolean
  reservation_cost?: Partial<{ [S in VEHICLE_TYPE]: number }> // Cost to reserve a spot per vehicle_type
}
