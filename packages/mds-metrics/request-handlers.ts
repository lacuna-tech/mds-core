import db from '@mds-core/mds-db'
import { inc, RuntimeError, ServerError } from '@mds-core/mds-utils'
import { EVENT_STATUS_MAP } from '@mds-core/mds-types'

import log from '@mds-core/mds-logger'
import {
  MetricsApiRequest,
  instantiateEventSnapshotResponse,
  instantiateStateSnapshotResponse,
  GetStateSnapshotResponse,
  GetEventsSnapshotResponse,
  GetTelemetryCountsResponse,
  GetEventCountsResponse,
  TelemetryCountsResponse,
  StateSnapshot,
  EventSnapshot,
  GetAllResponse
} from './types'
import { getTimeBins } from './utils'

export async function getStateSnapshot(req: MetricsApiRequest, res: GetStateSnapshotResponse) {
  const { body } = req
  const { provider_id } = body
  const slices = getTimeBins(body)

  try {
    const device_ids = (await db.readDeviceIds(provider_id)).map(device => device.device_id)
    const devices = await db.readDeviceList(device_ids)

    log.info(`Fetched ${devices.length} devices from db`)

    const eventsBySlice = await Promise.all(
      slices.map(slice => {
        const { end } = slice
        return db.readHistoricalEvents({ end_date: end })
      })
    )

    log.info(`Fetched ${eventsBySlice.length} event snapshots from db`)
    log.info(`First event slice has ${eventsBySlice[0].length} events`)
    log.info(`Last event slice has ${eventsBySlice[eventsBySlice.length - 1].length} events`)

    const result = eventsBySlice
      .map(events => {
        if (events) {
          const statusCounts = events.reduce((acc, event) => {
            const { event_type, device_id } = event
            const status = EVENT_STATUS_MAP[event_type]

            const { type } = devices.find(d => {
              return d.device_id === device_id
            }) || { type: undefined }

            if (type === undefined) {
              throw new RuntimeError(`Could not find corresponding device ${device_id} for event ${event}!`)
            }

            const incrementedSubAcc = { [type]: inc(acc[type], status) }
            return { ...acc, ...incrementedSubAcc }
          }, instantiateStateSnapshotResponse(0))

          log.info(`Snapshot: ${statusCounts}`)
          return statusCounts
        }
      })
      .filter((e): e is StateSnapshot => e !== undefined)

    const resultWithSlices = result.map((snapshot, idx) => {
      const slice = slices[idx]
      return { snapshot, slice }
    })

    log.info(`state_snapshot result: ${resultWithSlices}`)

    res.status(200).send(resultWithSlices)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError())
  }
}

export async function getEventSnapshot(req: MetricsApiRequest, res: GetEventsSnapshotResponse) {
  const { body } = req
  const { provider_id } = body
  const slices = getTimeBins(body)

  try {
    const device_ids = (await db.readDeviceIds(provider_id)).map(device => device.device_id)
    const devices = await db.readDeviceList(device_ids)

    log.info(`Fetched ${devices.length} devices from db`)

    const eventsBySlice = await Promise.all(
      slices.map(slice => {
        const { end } = slice
        return db.readHistoricalEvents({ end_date: end })
      })
    )

    log.info(`Fetched ${eventsBySlice.length} event snapshots from db`)
    log.info(`First event slice has ${eventsBySlice[0].length} events`)
    log.info(`Last event slice has ${eventsBySlice[eventsBySlice.length - 1].length} events`)

    const result = eventsBySlice
      .map(events => {
        if (events) {
          const eventCounts = events.reduce((acc, event) => {
            const { event_type, device_id } = event

            const { type } = devices.find(d => {
              return d.device_id === device_id
            }) || { type: undefined }

            if (type === undefined) {
              throw new RuntimeError(`Could not find corresponding device ${device_id} for event ${event}!`)
            }

            const incrementedSubAcc = { [type]: inc(acc[type], event_type) }

            return { ...acc, incrementedSubAcc }
          }, instantiateEventSnapshotResponse(0))

          log.info(`Snapshot: ${eventCounts}`)

          return eventCounts
        }
      })
      .filter((e): e is EventSnapshot => e !== undefined)

    const resultWithSlices = result.map((snapshot, idx) => {
      const slice = slices[idx]
      return { snapshot, slice }
    })

    log.info(`event_snapshot result: ${resultWithSlices}`)

    res.status(200).send(resultWithSlices)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError())
  }
}

export async function getTelemetryCounts(req: MetricsApiRequest, res: GetTelemetryCountsResponse) {
  const { body } = req
  const slices = getTimeBins(body)

  try {
    const telemetryCounts = await Promise.all(
      slices.map(slice => {
        const { start, end } = slice
        return db.getTelemetryCountsPerProviderSince(start, end)
      })
    )

    const telemetryCountsWithTimeSlices: TelemetryCountsResponse[] = telemetryCounts.map((telemetryCount, idx) => {
      const slice = slices[idx]
      return { telemetryCount, slice }
    })

    res.status(200).send(telemetryCountsWithTimeSlices)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError())
  }
}

export async function getEventCounts(req: MetricsApiRequest, res: GetEventCountsResponse) {
  const { body } = req
  const slices = getTimeBins(body)

  try {
    const eventCounts = await Promise.all(
      slices.map(slice => {
        const { start, end } = slice
        return db.getEventCountsPerProviderSince(start, end)
      })
    )

    const eventCountsWithTimeSlice = eventCounts.map((eventCount, idx) => {
      const slice = slices[idx]
      return { eventCount, slice }
    })

    res.status(200).send(eventCountsWithTimeSlice)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError(error))
  }
}

/*
  This method simply returns the time-binned metrics table rows with some basic querying.

  This method is a stopgap so the FE has something to display.

  It is scheduled to be replaced with methods that have better querying support
  and finer-grained field-fetching a la GraphQL.
*/
export async function getAll(req: MetricsApiRequest, res: GetAllResponse) {
  const { body } = req
  const slices = getTimeBins(body)

  try {
    const bucketedMetrics = await Promise.all(
      slices.map(slice => {
        const { start, end } = slice
        // TODO pull out geography_id and provider_id from request body
        // TODO add time aliases, see https://docs.google.com/document/d/1Zyn58tHo-VzibsdgmFU3fBcDlplUDxFzGWLHtTG4-Cs/edit?pli=1#bookmark=id.5snf8ffk8bjf
        return db.getAllMetrics({
          start_time: start,
          end_time: end,
          geography_id: null,
          provider_id: null
        })
      })
    )

    const bucketedMetricsWithTimeSlice = bucketedMetrics.map((bucketedMetricsRow, idx) => {
      const slice = slices[idx]
      return { bucketedMetricsRow, slice }
    })

    // TODO follow up with TSV formatting if necessary,
    // see https://lacuna-tech.slack.com/archives/CPY98QSS3/p1575314506007400

    res.status(200).send(bucketedMetricsWithTimeSlice)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError(error))
  }
}
