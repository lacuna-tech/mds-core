import { ApiRequest, ApiResponse } from '@mds-core/mds-api-server'
import {
  VEHICLE_STATUS,
  VEHICLE_EVENT,
  VEHICLE_TYPES,
  VEHICLE_TYPE,
  VEHICLE_EVENTS,
  VEHICLE_STATUSES
} from '@mds-core/mds-types'

export type MetricsApiRequest = ApiRequest
export type MetricsApiResponse = ApiResponse

export type StateSnapshotResponse = {
  [T in VEHICLE_TYPE]: { [S in VEHICLE_STATUS]: number }
}

export type EventSnapshotResponse = {
  [T in VEHICLE_TYPE]: { [S in VEHICLE_EVENT]: number }
}

export type CountsResponse = {
  [T in VEHICLE_TYPE]: number
}

export function instantiateEventSnapshotResponse(value: number) {
  return Object.keys(VEHICLE_TYPES).reduce((acc, vehicle_type) => {
    const typeRow = {
      [vehicle_type]: Object.keys(VEHICLE_EVENTS).reduce((acc2, event_type) => {
        const eventRow = { [event_type]: value }
        return { ...acc2, eventRow }
      }, {})
    }
    return { ...acc, typeRow }
  }, {}) as EventSnapshotResponse
}

export function instantiateStateSnapshotResponse(value: number) {
  return Object.keys(VEHICLE_TYPES).reduce((acc, vehicle_type) => {
    const typeRow = {
      [vehicle_type]: Object.keys(VEHICLE_STATUSES).reduce((acc2, event_type) => {
        const eventRow = { [event_type]: value }
        return { ...acc2, eventRow }
      }, {})
    }
    return { ...acc, typeRow }
  }, {}) as StateSnapshotResponse
}
