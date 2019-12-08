import db from '@mds-core/mds-db'
import log from '@mds-core/mds-logger'
import { MetricsTableRow, ProviderStreamData, UUID, Timestamp } from '@mds-core/mds-types'
import metric from './metrics'
import config from './config'

import { dataHandler } from './proc'

/*
    Provider processor that runs inside a Kubernetes pod, activated via cron job.
    Aggregates trips/event data at a set interval. Provider cache is cleaned as data
    is processed.

    The following postgres tables are updated as data is processed:

        REPORTS_PROVIDERS:
          PRIMARY KEY = (provider_id, timestamp, vehicle_type)
          VALUES = MetricsTableRow
*/

async function processProvider(providerID: UUID, curTime: Timestamp): Promise<boolean> {
  /*
    Add provider metadata into PG database.
    These metrics should be computed here on an interval basis rather than being event triggered.
  */
  // Only processing at organization level for scooters now
  // TODO: add providerMap back when streaming logic is added back to proc-event
  // const providersMap = await cache.hgetall('provider:state')
  // const providerData: ProviderStreamData = providersMap ? providersMap[providerID] : null

  const binStart = curTime - 3600000
  const binStartYesterday = binStart - 86400000
  const binEndYesterday = curTime - 86400000
  // TODO: convert hardcoded bin start time, vehicle_type and geography
  const provider_data: MetricsTableRow = {
    start_time: binStart,
    bin_size: 'hour',
    geography: null,
    provider_id: providerID,
    vehicle_type: 'scooter',
    event_counts: await metric.calcEventCounts(providerID, binStart, curTime),
    vehicle_counts: await metric.calcVehicleCounts(providerID, 0, binStart),
    trip_count: await metric.calcTripCount(providerID, binStart, curTime),
    vehicle_trips_count: await metric.calcVehicleTripCount(providerID, binStart, curTime),
    event_time_violations: await metric.calcLateEventCount(providerID, binStart, curTime),
    telemetry_distance_violations: await metric.calcTelemDistViolationCount(
      providerID,
      binStartYesterday,
      binEndYesterday
    ),
    bad_events: {
      invalid_count: null, // providerData ? providerData.invalidEvents.length : null,
      duplicate_count: null, //providerData ? providerData.duplicateEvents.length : null,
      out_of_order_count: null //providerData ? providerData.outOfOrderEvents.length : null
    },
    sla: {
      max_vehicle_cap: 1600, // TODO: import from PCE
      min_registered: config.compliance_sla.min_registered,
      min_trip_start_count: config.compliance_sla.min_trip_start_count,
      min_trip_end_count: config.compliance_sla.min_trip_end_count,
      min_telemetry_count: config.compliance_sla.min_telemetry_count,
      max_start_end_time: config.compliance_sla.max_start_end_time,
      max_enter_leave_time: config.compliance_sla.max_enter_leave_time,
      max_telemetry_time: config.compliance_sla.max_telemetry_time,
      max_telemetry_distance: config.compliance_sla.max_telemetry_distance
    }
  }

  try {
    await db.insertMetrics(provider_data)
  } catch (err) {
    log.error(err)
    return false
  }
  return true
}

async function providerAggregator(): Promise<boolean> {
  const curTime: Timestamp = new Date().getTime()
  const providersList: UUID[] = config.organization.providers
  await Promise.all(
    providersList.map(async provider => {
      if (await processProvider(provider, curTime)) {
        log.info('PROVIDER PROCESSED')
      } else {
        log.warn('PROVIDER NOT PROCESSED')
      }
    })
  )
  return true
}

async function providerHandler() {
  log.info('triggered')
  await dataHandler('provider', async () => {
    await providerAggregator()
  })
}

export { providerHandler }
