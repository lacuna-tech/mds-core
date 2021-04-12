import { Enum } from '../base'

export const VEHICLE_TYPES = Enum('car', 'bicycle', 'scooter', 'moped', 'other')
export type VEHICLE_TYPE = keyof typeof VEHICLE_TYPES
