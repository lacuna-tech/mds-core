import { ApiRequest, ApiResponse } from '@mds-core/mds-api-server'
import {
  VEHICLE_STATUS,
  VEHICLE_EVENT,
  VEHICLE_TYPES,
  VEHICLE_TYPE,
  VEHICLE_EVENTS,
  VEHICLE_STATUSES,
  Timestamp,
  UUID
} from '@mds-core/mds-types'

export type StateSnapshotResponse = {
  [T in VEHICLE_TYPE]: { [S in VEHICLE_STATUS]: number }
}

export type EventSnapshotResponse = {
  [T in VEHICLE_TYPE]: { [S in VEHICLE_EVENT]: number }
}

export type TelemetryCountsResponse = {
  telemetryCount: {
    count: number
    slacount: number
    provider_id: UUID
  }[]
  slice: {
    start: number
    end: number
  }
}

export type EventCountsResponse = {
  eventCount: {
    count: number
    slacount: number
    event_type: string
    provider_id: UUID
  }[]
  slice: {
    start: number
    end: number
  }
}

export type GetTimeBinsParams = {
  start_time: Timestamp
  end_time: Timestamp
  bin_size: Timestamp
}
export interface MetricsApiRequest extends ApiRequest {
  query: Partial<
    {
      [P in 'start_time' | 'end_time' | 'bin']: string
    }
  >
}

export type MetricsApiResponse<T> = ApiResponse<T | Error>
export type GetStateSnapshotResponse = MetricsApiResponse<StateSnapshotResponse[]>
export type GetEventsSnapshotResponse = MetricsApiResponse<EventSnapshotResponse[]>
export type GetTelemetryCountsResponse = MetricsApiResponse<TelemetryCountsResponse[]>
export type GetEventCountsResponse = MetricsApiResponse<EventCountsResponse[]>

export const instantiateEventSnapshotResponse = (value: number) =>
  Object.keys(VEHICLE_TYPES).reduce(
    (acc, vehicle_type) => ({
      ...acc,
      [vehicle_type]: Object.keys(VEHICLE_EVENTS).reduce((acc2, event_type) => {
        const eventRow = { [event_type]: value }
        return { ...acc2, eventRow }
      }, {})
    }),
    {}
  ) as EventSnapshotResponse

export const instantiateStateSnapshotResponse = (value: number) =>
  Object.keys(VEHICLE_TYPES).reduce(
    (acc, vehicle_type) => ({
      ...acc,
      [vehicle_type]: Object.keys(VEHICLE_STATUSES).reduce((acc2, event_type) => {
        const eventRow = { [event_type]: value }
        return { ...acc2, eventRow }
      }, {})
    }),
    {}
  ) as StateSnapshotResponse
