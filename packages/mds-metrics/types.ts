import { ApiRequest, ApiResponse } from '@mds-core/mds-api-server'
import { VEHICLE_STATUS, VEHICLE_EVENT, VEHICLE_TYPES } from '@mds-core/mds-types'
import { VEHICLE_TYPE, VEHICLE_EVENTS } from 'packages/mds-types/dist'

export type MetricsApiRequest = ApiRequest
export type MetricsApiResponse = ApiResponse

export type StateSnapshotResponse = {
  vehicle_type: { [T in VEHICLE_TYPE]: { [S in VEHICLE_STATUS]: number } }
}

export type EventSnapshotResponse = {
  [T in VEHICLE_TYPE]: { [S in VEHICLE_EVENT]: number }
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

export type CountsResponse = {
  vehicle_type: { [T in VEHICLE_TYPE]: number }
}
