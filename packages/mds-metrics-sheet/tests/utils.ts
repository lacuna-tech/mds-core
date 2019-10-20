import uuid from 'uuid'
import { VehicleCountRow, LastDayStatsResponse } from '../types'

export const getStatus = (): VehicleCountRow['status'] => {
  return {
    available: 42,
    reserved: 20,
    unavailable: 5,
    removed: 0,
    inactive: 3,
    trip: 5,
    elsewhere: 17
  }
}

export const getEvent = (): VehicleCountRow['event_type'] => {
  return {
    register: 42,
    service_start: 42,
    service_end: 42,
    provider_drop_off: 42,
    provider_pick_up: 42,
    agency_pick_up: 42,
    agency_drop_off: 42,
    reserve: 42,
    cancel_reservation: 42,
    trip_start: 42,
    trip_enter: 42,
    trip_leave: 42,
    trip_end: 42,
    deregister: 42
  }
}

export const getLastDayStatsResponse = (provider_id: string): LastDayStatsResponse => {
  return {
    // TODO type out
    [provider_id]: {
      trips_last_24h: 1,
      ms_since_last_event: 5582050,
      telemetry_counts_last_24h: 5,
      late_telemetry_counts_last_24h: 1,
      events_last_24h: 3,
      events_not_in_conformance: 1,
      name: 'fake-name',
      event_counts_last_24h: {
        register: 42,
        service_start: 42,
        service_end: 42,
        provider_drop_off: 42,
        provider_pick_up: 42,
        agency_pick_up: 42,
        agency_drop_off: 42,
        reserve: 42,
        cancel_reservation: 42,
        trip_start: 42,
        trip_enter: 42,
        trip_leave: 42,
        trip_end: 42,
        deregister: 42
      },
      late_event_counts_last_24h: {
        register: 42,
        service_start: 42,
        service_end: 42,
        provider_drop_off: 42,
        provider_pick_up: 42,
        agency_pick_up: 42,
        agency_drop_off: 42,
        reserve: 42,
        cancel_reservation: 42,
        trip_start: 42,
        trip_enter: 42,
        trip_leave: 42,
        trip_end: 42,
        deregister: 42
      }
    }
  }
}

export const getProvider = (): VehicleCountRow => {
  return {
    provider_id: uuid(),
    provider: 'fake-provider',
    count: 42,
    status: getStatus(),
    event_type: getEvent(),
    areas: {},
    areas_48h: {}
  }
}
