import { Enum, Timestamp, UUID } from './base'
import { VEHICLE_STATE } from './vehicle/vehicle_states'
import { VEHICLE_TYPE } from './vehicle/vehicle_types'

export const PROPULSION_TYPES = Enum('human', 'electric', 'electric_assist', 'hybrid', 'combustion')
export type PROPULSION_TYPE = keyof typeof PROPULSION_TYPES
export const RIGHT_OF_WAY_STATES = ['available', 'reserved', 'non_operational', 'trip'] as const

export const ACCESSIBILITY_OPTIONS = ['wheelchair_accessible'] as const
export type ACCESSIBILITY_OPTION = typeof ACCESSIBILITY_OPTIONS[number]

export const MODALITIES = ['micromobility', 'taxi', 'tnc'] as const
export type MODALITY = typeof MODALITIES[number]

// Represents a row in the "devices" table
export interface CoreDevice {
  device_id: UUID
  provider_id: UUID
  vehicle_id: string
}

// Represents a row in the "devices" table
export interface Device_v1_1_0 extends CoreDevice {
  vehicle_type: VEHICLE_TYPE // changed name in 1.0
  accessibility_options?: ACCESSIBILITY_OPTION[]
  propulsion_types: PROPULSION_TYPE[] // changed name in 1.0
  year?: number | null
  mfgr?: string | null
  modality: MODALITY
  model?: string | null
  recorded: Timestamp
  state?: VEHICLE_STATE | null
}
/**
 * This is an alias that must be updated in the event of future changes to the type.
 */
export type Device = Device_v1_1_0

export type DeviceID = Pick<Device, 'provider_id' | 'device_id'>
// Standard telemetry columns (used in more than one table)
