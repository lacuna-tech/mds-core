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

export const Enum = <T extends string>(...keys: T[]) =>
  Object.freeze(
    keys.reduce((e, key) => {
      return { ...e, [key]: key }
    }, {}) as { [K in T]: K }
  )

export const isEnum = (enums: { [key: string]: string }, value: unknown) =>
  typeof value === 'string' && typeof enums === 'object' && enums[value] === value

export const MICRO_VEHICLE_TYPES = ['car', 'bicycle', 'scooter', 'moped', 'recumbent'] as const
export type MICRO_VEHICLE_TYPE = typeof MICRO_VEHICLE_TYPES[number]

export const TAXI_VEHICLE_TYPES = ['taxi'] as const
export type TAXI_VEHICLE_TYPE = typeof TAXI_VEHICLE_TYPES[number]

export const VEHICLE_TYPES = [...MICRO_VEHICLE_TYPES, ...TAXI_VEHICLE_TYPES] as const
export type VEHICLE_TYPE = typeof VEHICLE_TYPES[number]

export const RULE_TYPES = Enum('count', 'speed', 'time', 'user')
export type RULE_TYPE = keyof typeof RULE_TYPES

export const RULE_UNIT_MAP = {
  minutes: 60,
  hours: 60 * 60
}

export const PROPULSION_TYPES = Enum('human', 'electric', 'electric_assist', 'hybrid', 'combustion')
export type PROPULSION_TYPE = keyof typeof PROPULSION_TYPES

export const MICRO_VEHICLE_STATUSES = [
  'available',
  'reserved',
  'unavailable',
  'removed',
  'inactive',
  'trip',
  'elsewhere'
] as const

export const TAXI_VEHICLE_STATUSES = ['available', 'unavailable', 'reserved', 'trip', 'stopped', 'elsewhere'] as const

export const VEHICLE_STATUSES = [...MICRO_VEHICLE_STATUSES, ...TAXI_VEHICLE_STATUSES]
export type VEHICLE_STATUS = typeof VEHICLE_STATUSES[number]

export const RIGHT_OF_WAY_STATUSES = ['available', 'reserved', 'unavailable', 'trip']

export const MICRO_EVENTS = [
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
] as const

export type MICRO_EVENT = typeof MICRO_EVENTS[number]

export const TAXI_EVENTS = [
  'service_start',
  'service_end',
  'service_enter',
  'service_leave',
  'depot_enter',
  'depot_leave',
  'reserve',
  'reserve_enter',
  'cancel_reservation',
  'reserve_stop',
  'trip_stop',
  'trip_start',
  'trip_resume',
  'trip_leave',
  'trip_enter'
] as const

export type TAXI_EVENT = typeof TAXI_EVENTS[number]

export const VEHICLE_EVENTS = [...MICRO_EVENTS, ...TAXI_EVENTS]

export type VEHICLE_EVENT = typeof VEHICLE_EVENTS[number]

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

export const AUDIT_EVENT_TYPES = Enum('start', 'note', 'summary', 'issue', 'telemetry', 'end')
export type AUDIT_EVENT_TYPE = keyof typeof AUDIT_EVENT_TYPES

export const EVENT_STATUS_MAP: { [P in VEHICLE_EVENT]: VEHICLE_STATUS } = {
  register: 'removed',
  service_start: 'available',
  service_end: 'unavailable',
  provider_drop_off: 'available',
  provider_pick_up: 'removed',
  agency_pick_up: 'removed',
  agency_drop_off: 'available',
  reserve: 'reserved',
  reserve_stop: 'stopped',
  cancel_reservation: 'available',
  trip_start: 'trip',
  trip_enter: 'trip',
  trip_leave: 'elsewhere',
  trip_end: 'available',
  deregister: 'inactive',
  service_enter: 'available',
  service_leave: 'elsewhere',
  depot_enter: 'removed',
  depot_leave: 'unavailable',
  reserve_enter: 'reserved',
  trip_stop: 'stopped',
  trip_resume: 'trip'
}

const StatusEventMap = <T extends { [S in VEHICLE_STATUS]: Partial<typeof VEHICLE_EVENTS> }>(map: T) => map

export const STATUS_EVENT_MAP = StatusEventMap({
  available: [
    'service_start',
    'provider_drop_off',
    'cancel_reservation',
    'agency_drop_off',
    'trip_end',
    'service_enter'
  ],
  reserved: ['reserve', 'reserve_enter'],
  unavailable: ['service_end', 'depot_leave'],
  trip: ['trip_start', 'trip_enter', 'trip_resume'],
  elsewhere: ['trip_leave', 'service_leave'],
  removed: ['register', 'provider_pick_up', 'agency_pick_up', 'depot_enter'],
  inactive: ['deregister'],
  stopped: ['reserve_stop', 'trip_stop']
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
export type Nullable<T> = T | null
export type NullableProperties<T extends object> = {
  [P in keyof T]-?: T[P] extends null ? T[P] : Nullable<T[P]>
}
export type SingleOrArray<T> = T | T[]
export type Optional<T, P extends keyof T> = Omit<T, P> & Partial<Pick<T, P>>
export type NonEmptyArray<T> = [T, ...T[]]

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

export interface PolicyMessage {
  [key: string]: string
}

interface BaseRule<RuleType = 'count' | 'speed' | 'time'> {
  name: string
  rule_id: UUID
  geographies: UUID[]
  statuses: Partial<{ [S in VEHICLE_STATUS]: typeof STATUS_EVENT_MAP[S] | [] }> | null
  rule_type: RuleType
  vehicle_types?: VEHICLE_TYPE[] | null
  maximum?: number | null
  minimum?: number | null
  start_time?: string | null
  end_time?: string | null
  days?: DAY_OF_WEEK[] | null
  /* eslint-reason TODO: message types haven't been defined well yet */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  messages?: PolicyMessage
  value_url?: URL | null
}

export type CountRule = BaseRule<'count'>

export interface TimeRule extends BaseRule<'time'> {
  rule_units: 'minutes' | 'hours'
}

export interface SpeedRule extends BaseRule<'speed'> {
  rule_units: 'kph' | 'mph'
}

export type UserRule = BaseRule<'user'>

export type Rule = CountRule | TimeRule | SpeedRule | UserRule

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

// eslint-reason recursive declarations require interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonArray extends Array<Json> {}

export interface JsonObject {
  [property: string]: Json
}

export type JsonValue = string | number | boolean | JsonArray | JsonObject

export type Json = Nullable<JsonValue>
// eslint-reason Function and constructor inference must use a single rest parameter of type 'any[]'
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFunction<A = any> = (...args: any[]) => A
export type AnyConstructor<A = object> = new (...args: any[]) => A

const ACCESSIBILITY_OPTIONS = ['wheelchair_boarding'] as const
type ACCESSIBILITY_OPTION = typeof ACCESSIBILITY_OPTIONS[number]

const PAYMENT_METHODS = ['cash', 'debit', 'credit', 'equity_program']
type PAYMENT_METHOD = typeof PAYMENT_METHODS[number]

const RESERVATION_METHODS = ['app', 'street_hail', 'phone_dispatch']
type RESERVATION_METHOD = typeof RESERVATION_METHODS[number]

const RESERVATION_TYPES = ['on_demand', 'scheduled']
type RESERVATION_TYPE = typeof RESERVATION_TYPES[number]

export interface TripMetadata {
  trip_id: UUID
  reserve_time: Timestamp
  dispatch_time: Timestamp
  trip_start_time: Timestamp
  trip_end_time: Timestamp
  distance: number // Distance in meters
  accessibility_options_used: ACCESSIBILITY_OPTION[]
  fare: {
    quoted_cost: number
    actual_cost: number
    components: { [entity: string]: number } // e.g. entity = 'LAX_AIRPORT_FEE'
    currency: string
    payment_methods: Partial<{ [method in PAYMENT_METHOD]: number }>
  }
  reservation_method: RESERVATION_METHOD
  reservation_type: RESERVATION_TYPE
}
