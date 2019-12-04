import db from '@mds-core/mds-db'
import cache from '@mds-core/mds-cache'
import {
  StateEntry,
  EVENT_STATUS_MAP,
  VEHICLE_STATUSES_ROW,
  VehicleCountMetricObj,
  MetricCount,
  LateMetricObj,
  VEHICLE_EVENT
} from '@mds-core/mds-types'

// TODO: refactor
async function calcEventCounts(id: string) {
  const events = await db.getStates(id)
  const eventCounts: { [S in VEHICLE_EVENT]: number } = {
    service_start: 0,
    provider_drop_off: 0,
    trip_end: 0,
    cancel_reservation: 0,
    reserve: 0,
    service_end: 0,
    trip_start: 0,
    trip_enter: 0,
    trip_leave: 0,
    register: 0,
    provider_pick_up: 0,
    agency_drop_off: 0,
    deregister: 0,
    agency_pick_up: 0
  }

  /* eslint-reason FIXME use map() */
  /* eslint-disable-next-line guard-for-in */
  for (const event_type in EVENT_STATUS_MAP) {
    eventCounts[event_type as VEHICLE_EVENT] = events.filter((event: StateEntry) => {
      return event.event_type === event_type
    }).length
  }
  return eventCounts
}

async function calcVehicleCounts(id: string): Promise<VehicleCountMetricObj | null> {
  const events = await db.getStates(id)
  const stateCache = await cache.readAllDeviceStates()
  if (!stateCache) {
    return null
  }
  const recentStates = Object.values(stateCache)

  // Calculate total number of registered vehicles at start of bin
  const histRegistered = events.filter((event: StateEntry) => {
    return event.event_type === 'register'
  }).length
  const histDeregistered = events.filter((event: StateEntry) => {
    return event.event_type === 'deregister'
  }).length
  const currRegistered = histRegistered - histDeregistered

  // Calculate total number of vehicle in Right of way
  // TODO: 48 hour filtering
  let count = 0

  /* eslint-reason FIXME use map() */
  /* eslint-disable-next-line guard-for-in */
  for (const i in recentStates) {
    const deviceState = recentStates[i]
    if (VEHICLE_STATUSES_ROW.includes(String(deviceState.state))) {
      count += 1
    }
  }
  // vehicle_counts.deployed = recent_states.filter(function(recent_states: any) {
  //  return recent_states.state === "available"
  // }).length

  const vehicleCounts: VehicleCountMetricObj = {
    registered: currRegistered,
    deployed: count,
    dead: null
  }
  return vehicleCounts
}

async function calcTripCount(id: string, curTime: number): Promise<number> {
  const lastHour = curTime - 3600000
  const tripCount = await db.getTripCount(id, lastHour, curTime)
  return tripCount[0].count
}

async function calcVehicleTripCount(id: string, curTime: number): Promise<string | null> {
  const maxTrips = 5
  const tripCountArray = new Array(maxTrips + 1).fill(0)
  const rs = await cache.readAllDeviceStates()
  if (!rs) {
    return null
  }
  const vehicles = Object.keys(rs)
  const lastHour = curTime - 3600000
  // TODO: migrate form inefficient loop once SET is created in cache
  /* eslint-reason FIXME use map() */
  /* eslint-disable-next-line guard-for-in */
  for (const i in vehicles) {
    const [providerID, deviceID] = vehicles[i].split(':')
    if (providerID === id) {
      /* eslint-reason FIXME use Promise.all() */
      /* eslint-disable-next-line no-await-in-loop */
      const tripCount = await db.getVehicleTripCount(deviceID, lastHour, curTime)
      const tripCountIndex = tripCount[0].count
      if (tripCountIndex >= maxTrips) {
        tripCountArray[maxTrips] += 1
      } else {
        tripCountArray[tripCountIndex] += 1
      }
    }
  }
  return String(tripCountArray)
}

async function calcLateEventCount(id: string, curTime: number): Promise<LateMetricObj> {
  const last_hour = curTime - 3600000
  const se = await db.getLateEventCount(id, ['trip_start', 'trip_end'], last_hour, curTime)
  const el = await db.getLateEventCount(id, ['trip_enter', 'trip_leave'], last_hour, curTime)
  const t = await db.getLateTelemetryCount(id, last_hour, curTime)

  const lateStartEnd = {
    count: se[0].count
  } as MetricCount
  const lateEnterLeave = {
    count: el[0].count
  } as MetricCount
  const lateTelemetry = {
    count: t[0].count
  } as MetricCount

  const lateMetric: LateMetricObj = {
    start_end: lateStartEnd,
    enter_leave: lateEnterLeave,
    telemetry: lateTelemetry
  }
  return lateMetric
}

async function calcTelemDistViolationCount(id: string, curTime: number): Promise<MetricCount> {
  // Calculating for trips that ended 24 hours ago in an hour bin
  const binEnd = curTime - 86400000
  const binStart = binEnd - 90000000
  const trips = await db.getTrips(id, binStart, binEnd)

  const countArray = trips
    .map(trip => {
      return trip.violation_count
    })
    .filter(e => !!e) as number[]
  const avgArray = trips
    .map(trip => {
      return trip.avg_violation_dist
    })
    .filter(e => !!e) as number[]
  const maxArray = trips
    .map(trip => {
      return trip.max_violation_dist
    })
    .filter(e => !!e) as number[]
  const minArray = trips
    .map(trip => {
      return trip.min_violation_dist
    })
    .filter(e => !!e) as number[]

  const telemViolations: MetricCount =
    countArray.length > 0
      ? {
          count: countArray.reduce((a, b) => a + b, 0),
          average: avgArray.reduce((a, b) => a + b, 0) / avgArray.length,
          min: Math.min(...minArray),
          max: Math.max(...maxArray)
        }
      : { count: 0 }
  return telemViolations
}

export = {
  calcEventCounts,
  calcVehicleCounts,
  calcTripCount,
  calcVehicleTripCount,
  calcLateEventCount,
  calcTelemDistViolationCount
}
