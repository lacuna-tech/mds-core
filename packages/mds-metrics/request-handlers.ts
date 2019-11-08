import log from '@mds-core/mds-logger'

import db from '@mds-core/mds-db'
import { inc, RuntimeError, yesterday } from '@mds-core/mds-utils'
import { EVENT_STATUS_MAP } from '@mds-core/mds-types'
import { now } from 'moment'
import {
  MetricsApiRequest,
  MetricsApiResponse,
  instantiateEventSnapshotResponse,
  instantiateStateSnapshotResponse
} from './types'

export async function getStateSnapshot(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)

  const { start_time = yesterday(), end_time = now(), bin = 3600000 } = params

  const interval = end_time - start_time

  const bins = new Array(Math.floor(interval / bin))

  const slices = bins.map((_, idx) => ({
    start: start_time + idx * bin,
    end: start_time + (idx + 1) * bin
  }))

  const device_ids = (await db.readDeviceIds(params.provider_id)).map(device => device.device_id)
  const devices = await db.readDeviceList(device_ids)

  const es = await Promise.all(
    slices.map(slice => {
      const { end } = slice
      return db.readHistoricalEvents({ end_date: end })
    })
  )

  const result = es.map(e => {
    const statusCounts = e.reduce((acc, event) => {
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
  })

  res.status(200).send(result)
}

export async function getEventSnapshot(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)

  const { start_time = yesterday(), end_time = now(), bin = 3600000 } = params

  const interval = end_time - start_time

  const bins = new Array(Math.floor(interval / bin))

  const slices = bins.map((_, idx) => ({ start: start_time + idx * bin, end: start_time + (idx + 1) * bin }))

  const device_ids = (await db.readDeviceIds(params.provider_id)).map(device => device.device_id)
  const devices = await db.readDeviceList(device_ids)

  const es = await Promise.all(
    slices.map(slice => {
      const { end } = slice
      return db.readHistoricalEvents({ end_date: end })
    })
  )

  const result = es.map(e => {
    const eventCounts = e.reduce((acc, event) => {
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
  })

  res.status(200).send(result)
}

export async function getTelemetryCounts(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req

  const { start_time = yesterday(), end_time = now(), bin = 3600000 } = params

  const interval = end_time - start_time

  const bins = new Array(Math.floor(interval / bin))

  const slices = bins.map((_, idx) => ({ start: start_time + idx * bin, end: start_time + (idx + 1) * bin }))

  const telemetryCounts = await Promise.all(
    slices.map(slice => {
      const { start, end } = slice
      return db.getTelemetryCountsPerProviderSince(start, end)
    })
  )

  const telemetryCountsWithTimeSlices = telemetryCounts.map((telemetryCount, idx) => {
    const slice = slices[idx]
    return { telemetryCount, slice }
  })

  res.status(200).send(telemetryCountsWithTimeSlices)
}

export async function getEventCounts(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req

  const { start_time = yesterday(), end_time = now(), bin = 3600000 } = params

  const interval = end_time - start_time

  const bins = new Array(Math.floor(interval / bin))

  const slices = bins.map((_, idx) => ({ start: start_time + idx * bin, end: start_time + (idx + 1) * bin }))

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
}
