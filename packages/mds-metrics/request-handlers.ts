import log from '@mds-core/mds-logger'

import db from '@mds-core/mds-db'
import { inc } from '@mds-core/mds-utils'
import { VEHICLE_TYPES } from 'packages/mds-types'
import { MetricsApiRequest, MetricsApiResponse, instantiateEventSnapshotResponse } from './types'
// import db from '@mds-core/mds-db'

export async function getStateSnapshot(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)
  res.status(200).send('Tada')
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
    }) || { type: VEHICLE_TYPES.scooter }

    const incrementedSubAcc = { [type]: inc(acc[type], event_type) }

    return { ...acc, incrementedSubAcc }
  }, instantiateEventSnapshotResponse(0))

  res.status(200).send(eventCounts)
}

export async function getLatency(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)
  res.status(200).send('Tada')
}

export async function getTelemetryCount(req: MetricsApiRequest, res: MetricsApiResponse) {
  const { params } = req
  log.info(params)
  res.status(200).send('Tada')
}
