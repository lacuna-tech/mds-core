import db from '@mds-core/mds-db'
import log from '@mds-core/mds-logger'
import { MetricsTableRow, ProviderStreamData } from '@mds-core/mds-types'
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

async function processProvider(providerID: string, curTime: number): Promise<boolean> {
  /*
    Add provider metadata into PG database.
    These metrics should be computed here on an interval basis rather than being event triggered.
  */
  // TODO: decide between seperate aggerator services for vehicle type/jurisdiction.
  // Only processing at organization level for scooters now
  // const providersMap = await cache.hgetall('provider:state')
  const providersMap = null
  const providerData: ProviderStreamData = providersMap ? JSON.parse(providersMap[providerID]) : null

  // TODO: convert hardcoded bin start time, vehicle_type and geography
  const provider_data: MetricsTableRow = {
    start_time: curTime - 3600000,
    bin_size: 'hour',
    geography: null,
    provider_id: providerID,
    vehicle_type: 'scooter',
    event_counts: await metric.calcEventCounts(providerID),
    vehicle_counts: await metric.calcVehicleCounts(providerID),
    trip_count: await metric.calcTripCount(providerID, curTime),
    vehicle_trips_count: await metric.calcVehicleTripCount(providerID, curTime),
    event_time_violations: await metric.calcLateEventCount(providerID, curTime),
    telemetry_distance_violations: await metric.calcTelemDistViolationCount(providerID, curTime),
    bad_events: {
      invalid_count: providerData ? providerData.invalidEvents.length : null,
      duplicate_count: providerData ? providerData.duplicateEvents.length : null,
      out_of_order_count: providerData ? providerData.outOfOrderEvents.length : null
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

  // Insert into PG DB and stream
  try {
    await db.insertMetrics(provider_data)
    log.info('INSERT')
  } catch (err) {
    await log.error(err)
    return false
  }
  // await stream.writeCloudEvent('mds.processed.provider', JSON.stringify(provider_data))

  return true
}

async function providerAggregator() {
  const curTime = new Date().getTime()
  const providersList = config.organization.providers

  /* eslint-reason FIXME use map() */
  /* eslint-disable-next-line guard-for-in */
  for (const id in providersList) {
    /* eslint-reason FIXME use Promise.all() */
    /* eslint-disable-next-line no-await-in-loop */
    const providerProcessed = await processProvider(providersList[id], curTime)
    if (providerProcessed) {
      log.info('PROVIDER PROCESSED')
    } else {
      /* eslint-reason FIXME use Promise.all() */
      /* eslint-disable-next-line no-await-in-loop */
      await log.warn('PROVIDER NOT PROCESSED')
    }
  }
}

async function providerHandler() {
  await dataHandler('provider', async () => {
    await providerAggregator()
  })
}

export { providerHandler }
