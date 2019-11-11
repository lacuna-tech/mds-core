import db from '@mds-core/mds-db'
import { inc, RuntimeError, yesterday, ServerError } from '@mds-core/mds-utils'
import { EVENT_STATUS_MAP } from '@mds-core/mds-types'
import { now } from 'moment'
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
  EventSnapshotResponse,
  StateSnapshotResponse
} from './types'
import { getTimeBins } from './utils'

export async function getStateSnapshot(req: MetricsApiRequest, res: GetStateSnapshotResponse) {
  const { start_time = yesterday(), end_time = now(), bin_size = 3600000, provider_id } = req.body
  const slices = getTimeBins({ start_time, end_time, bin_size })

  try {
    const device_ids = (await db.readDeviceIds(provider_id)).map(device => device.device_id)
    const devices = await db.readDeviceList(device_ids)

    const eventsBySlice = await Promise.all(
      slices.map(slice => {
        const { end } = slice
        return db.readHistoricalEvents({ end_date: end })
      })
    )

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

            return { ...acc, incrementedSubAcc }
          }, instantiateStateSnapshotResponse(0))

          return statusCounts
        }
      })
      .filter((e): e is StateSnapshotResponse => e !== undefined)

    res.status(200).send(result)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError())
  }
}

export async function getEventSnapshot(req: MetricsApiRequest, res: GetEventsSnapshotResponse) {
  const { start_time = yesterday(), end_time = now(), bin_size = 3600000, provider_id } = req.body

  const slices = getTimeBins({ start_time, end_time, bin_size })

  try {
    const device_ids = (await db.readDeviceIds(provider_id)).map(device => device.device_id)
    const devices = await db.readDeviceList(device_ids)

    const eventsBySlice = await Promise.all(
      slices.map(slice => {
        const { end } = slice
        return db.readHistoricalEvents({ end_date: end })
      })
    )

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

          return eventCounts
        }
      })
      .filter((e): e is EventSnapshotResponse => e !== undefined)

    res.status(200).send(result)
  } catch (error) {
    await log.error(error)
    res.status(500).send(new ServerError())
  }
}

export async function getTelemetryCounts(req: MetricsApiRequest, res: GetTelemetryCountsResponse) {
  const { start_time = yesterday(), end_time = now(), bin_size = 3600000 } = req.body

  const slices = getTimeBins({ start_time, end_time, bin_size })

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
  const { start_time = yesterday(), end_time = now(), bin_size = 3600000 } = req.body

  const slices = getTimeBins({ start_time, end_time, bin_size })

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
