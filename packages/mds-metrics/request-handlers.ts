import log from '@mds-core/mds-logger'

import db from '@mds-core/mds-db'
import { inc, RuntimeError, yesterday } from '@mds-core/mds-utils'
import { EVENT_STATUS_MAP } from '@mds-core/mds-types'
import {
  MetricsApiRequest,
  MetricsApiResponse,
  instantiateEventSnapshotResponse,
  instantiateStateSnapshotResponse
} from './types'
import { now } from 'moment'

// import db from '@mds-core/mds-db'

export async function getStateSnapshot(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)

  const { events } = await db.readEvents(params)
  const device_ids = (await db.readDeviceIds(params.provider_id)).map(device => device.device_id)
  const devices = await db.readDeviceList(device_ids)
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

  res.status(200).send(statusCounts)
}

export async function getEventSnapshot(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)

  const { events } = await db.readEvents(params)
  const device_ids = (await db.readDeviceIds(params.provider_id)).map(device => device.device_id)
  const devices = await db.readDeviceList(device_ids)
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

  res.status(200).send(eventCounts)
}

export async function getTelemetryCounts(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req

  const {start_time = now(), end_time = yesterday(), bin = 3600000} = params

  const slices = []

  for (const time: number = start_time; time < end_time; time + bin) {
    const next_time = time + bin
    slices.push({start: time, end: next_time})
  }

  const telemetryCounts = Promise.all(slices.map(slice => {
    const {start, end} = slice
    return db.getTelemetryCountsPerProviderSince(start, end)
  }))

  res.status(200).send(telemetryCounts)
}

export async function getEventCounts(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req

  const {start_time = now(), end_time = yesterday(), bin = 3600000} = params

  const slices = []

  for (const time: number = start_time; time < end_time; time + bin) {
    const next_time = time + bin
    slices.push({start: time, end: next_time})
  }

  const eventCounts = Promise.all(slices.map(slice => {
    const {start, end} = slice
    return db.getEventCountsPerProviderSince(start, end)
  }))

  res.status(200).send(eventCounts)
}