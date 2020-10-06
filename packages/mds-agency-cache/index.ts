/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import logger from '@mds-core/mds-logger'

import flatten from 'flat'
import { NotFoundError, nullKeys, stripNulls, now, isInsideBoundingBox, routeDistance } from '@mds-core/mds-utils'
import {
  UUID,
  Timestamp,
  Device,
  VehicleEvent,
  Telemetry,
  BoundingBox,
  EVENT_STATUS_MAP,
  VEHICLE_STATUSES
} from '@mds-core/mds-types'

import { RedisCache } from '@mds-core/mds-cache'

import { parseTelemetry, parseEvent, parseDevice, parseCachedItem } from './unflatteners'
import {
  CacheReadDeviceResult,
  CachedItem,
  StringifiedCacheReadDeviceResult,
  StringifiedEventWithTelemetry,
  StringifiedTelemetry,
  StringifiedEvent
} from './types'

const { env } = process

const { unflatten } = flatten

const client = RedisCache()

// optionally prefix a 'tenantId' key given the redis is a shared service across deployments
function decorateKey(key: string): string {
  return env.TENANT_ID ? `${env.TENANT_ID}:${key}` : key
}

async function getClient() {
  return client
}

async function info() {
  const results = await client.info()
  const lines = results.split('\r\n')
  const data: { [propName: string]: string | number } = {}
  lines.map(line => {
    const [key, val] = line.split(':')
    if (val !== undefined) {
      if (Number.isNaN(Number(val))) {
        data[key] = val
      } else {
        data[key] = parseFloat(val)
      }
    }
  })
  return data
}

// update the ordered list of (device_id, timestamp) tuples
// so that we can trivially get a list of "updated since ___" device_ids
async function updateVehicleList(device_id: UUID, timestamp?: Timestamp) {
  const when = timestamp || now()
  // logger.info('redis zadd', device_id, when)
  return client.zadd(decorateKey('device-ids'), [when, device_id])
}
async function hread(suffix: string, device_id: UUID): Promise<CachedItem> {
  if (!device_id) {
    throw new Error(`hread: tried to read ${suffix} for device_id ${device_id}`)
  }
  const key = decorateKey(`device:${device_id}:${suffix}`)
  const flat = await client.hgetall(key)
  if (flat) {
    return unflatten({ ...flat, device_id })
  }
  throw new NotFoundError(`${suffix} for ${device_id} not found`)
}

/* Store latest known lat/lng for a given device in a redis geo-spatial analysis compatible manner. */
async function addGeospatialHash(device_id: UUID, coordinates: [number, number]) {
  const [lat, lng] = coordinates
  const res = await client.geoadd(device_id, lng, lat)
  return res
}

async function getEventsInBBox(bbox: BoundingBox) {
  const start = now()
  const [pt1, pt2] = bbox
  const points = bbox.map(pt => {
    return { lat: pt[0], lng: pt[1] }
  })
  const [lng, lat] = [(pt1[0] + pt2[0]) / 2, (pt1[1] + pt2[1]) / 2]
  const radius = routeDistance(points)
  const events = client.georadius(decorateKey('locations'), lng, lat, radius, 'm')
  const finish = now()
  const timeElapsed = finish - start
  logger.info(`mds-agency-cache getEventsInBBox ${JSON.stringify(bbox)} time elapsed: ${timeElapsed}ms`)
  return events
}

async function hreads(
  suffixes: string[],
  ids: UUID[],
  prefix: 'device' | 'provider' = 'device'
): Promise<CachedItem[]> {
  if (suffixes === undefined) {
    throw new Error('hreads: no suffixes')
  }
  if (ids === undefined) {
    throw new Error('hreads: no ids')
  }
  // bleah
  const multi = client.multi()

  await Promise.all(
    suffixes.map(suffix =>
      ids.map(id => {
        return multi.hgetall(decorateKey(`${prefix}:${id}:${suffix}`))
      })
    )
  )

  const replies = await multi.exec()
  return replies.map((flat, index) => {
    if (flat) {
      const flattened = { ...flat, [`${prefix}_id`]: ids[index % ids.length] }
      return unflatten(flattened)
    }
    return unflatten(null)
  })
}

// anything with a device_id, e.g. device, telemetry, etc.
async function hwrite(suffix: string, item: CacheReadDeviceResult | Telemetry | VehicleEvent) {
  if (typeof item.device_id !== 'string') {
    logger.error(`hwrite: invalid device_id ${item.device_id}`)
    throw new Error(`hwrite: invalid device_id ${item.device_id}`)
  }
  const { device_id } = item
  const key = decorateKey(`device:${device_id}:${suffix}`)
  const flat: { [key: string]: unknown } = flatten(item)
  const nulls = nullKeys(flat)
  const hmap = stripNulls(flat) as { [key: string]: unknown; device_id?: UUID }
  delete hmap.device_id

  if (nulls.length > 0) {
    // redis doesn't store null keys, so we have to delete them
    // TODO unit-test
    await client.hdel(key, ...nulls)
  }

  await Promise.all(
    (suffix === 'event' ? [decorateKey(`provider:${item.provider_id}:latest_event`), key] : [key]).map(k =>
      client.hmset(k, hmap)
    )
  )

  return updateVehicleList(device_id)
}

// put basics of device in the cache
async function writeDevice(device: Device) {
  if (!device) {
    throw new Error('null device not legal to write')
  }
  return hwrite('device', device)
}

async function readKeys(pattern: string) {
  return client.keys(decorateKey(pattern))
}

async function getMostRecentEventByProvider(): Promise<{ provider_id: string; max: number }[]> {
  const provider_ids = (await readKeys('provider:*:latest_event')).map(key => {
    const [, provider_id] = key.split(':')
    return provider_id
  })
  const result = await hreads(['latest_event'], provider_ids, 'provider')
  return result.map(elem => {
    const max = parseInt(elem.timestamp || '0')
    return { provider_id: elem.provider_id, max }
  })
}

async function wipeDevice(device_id: UUID) {
  const keys = [
    decorateKey(`device:${device_id}:event`),
    decorateKey(`device:${device_id}:telemetry`),
    decorateKey(`device:${device_id}:device`)
  ]
  if (keys.length > 0) {
    logger.info('del', ...keys)
    return client.del(...keys)
  }
  logger.info('no keys found for', device_id)
  return 0
}

async function writeEvent(event: VehicleEvent) {
  // FIXME cope with out-of-order -- check timestamp
  // logger.info('redis write event', event.device_id)
  try {
    if (event.event_type === 'deregister') {
      return await wipeDevice(event.device_id)
    }
    const prev_event = parseEvent((await hread('event', event.device_id)) as StringifiedEventWithTelemetry)
    if (prev_event.timestamp < event.timestamp) {
      try {
        if (event.telemetry) {
          const { lat, lng } = event.telemetry.gps
          await addGeospatialHash(event.device_id, [lat, lng])
        }
        return hwrite('event', event)
      } catch (err) {
        logger.error('hwrites', err.stack)
        throw err
      }
    } else {
      return null
    }
  } catch (_) {
    try {
      if (event.telemetry) {
        const { lat, lng } = event.telemetry.gps
        await addGeospatialHash(event.device_id, [lat, lng])
      }
      return hwrite('event', event)
    } catch (err) {
      logger.error('hwrites', err.stack)
      throw err
    }
  }
}

async function readEvent(device_id: UUID): Promise<VehicleEvent> {
  const rawEvent = await hread('event', device_id)
  const event = parseEvent(rawEvent as StringifiedEventWithTelemetry)
  return event
}

async function readEvents(device_ids: UUID[]): Promise<VehicleEvent[]> {
  const events = await hreads(['event'], device_ids)
  return events
    .map(e => {
      return parseEvent(e as StringifiedEventWithTelemetry)
    })
    .filter(e => Boolean(e))
}

async function readAllEvents(): Promise<Array<VehicleEvent | null>> {
  // FIXME wildcard searching is slow
  let start = now()
  const keys = await readKeys('device:*:event')
  let finish = now()
  let timeElapsed = finish - start
  logger.info(`MDS-DAILY /admin/events -> cache.readAllEvents() readKeys() time elapsed: ${timeElapsed}ms`)
  const device_ids = keys.map(key => {
    const [, device_id] = key.split(':')
    return device_id
  })

  start = now()
  const result = (await hreads(['event'], device_ids)).map(event => {
    return parseEvent(event as StringifiedEventWithTelemetry)
  })
  finish = now()
  timeElapsed = finish - start
  logger.info(`MDS-DAILY /admin/events -> cache.readAllEvents() hreads() time elapsed: ${timeElapsed}ms`)

  return result
}

async function readDevice(device_id: UUID) {
  if (!device_id) {
    throw new Error('null device not legal to read')
  }
  // logger.info('redis read device', device_id)
  const rawDevice = await hread('device', device_id)
  const device = parseDevice(rawDevice as StringifiedCacheReadDeviceResult)
  return device
}

async function readDevices(device_ids: UUID[]) {
  // logger.info('redis read device', device_id)
  return ((await hreads(['device'], device_ids)) as StringifiedCacheReadDeviceResult[]).map(device => {
    return parseDevice(device)
  })
}

async function readDeviceStatus(device_id: UUID) {
  // Read event and device in parallel, catching NotFoundErrors
  const promises = [readEvent(device_id), readDevice(device_id)].map((p: Promise<{}>) =>
    /* eslint-disable-next-line promise/prefer-await-to-callbacks */
    p.catch((err: Error) => {
      if (err.name !== 'NotFoundError') {
        throw err
      }
    })
  )
  try {
    const results = await Promise.all(promises)
    const deviceStatusMap: { [device_id: string]: CachedItem | {} } = {}
    results
      .filter((item): item is CachedItem => item !== undefined)
      .map(item => {
        deviceStatusMap[item.device_id] = deviceStatusMap[item.device_id] || {}
        Object.assign(deviceStatusMap[item.device_id], item)
      })
    const statuses = Object.values(deviceStatusMap)
    return statuses.find((status: any) => status.telemetry) || statuses[0] || null
  } catch (err) {
    logger.error('Error reading device status', err)
    throw err
  }
}

/* eslint-reason redis external lib weirdness */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/catch-or-return */
async function readDevicesStatus(query: {
  since?: number
  skip?: number
  take?: number
  bbox: BoundingBox
  strict?: boolean
}) {
  logger.info('readDevicesStatus', JSON.stringify(query), 'start')
  const start = query.since || 0
  const stop = now()
  const strictChecking = query.strict

  logger.info('redis zrangebyscore device-ids', start, stop)
  const geoStart = now()
  const { bbox } = query
  const deviceIdsInBbox = await getEventsInBBox(bbox)
  const deviceIdsRes =
    deviceIdsInBbox.length === 0 ? await client.zrangebyscore(decorateKey('device-ids'), start, stop) : deviceIdsInBbox
  const skip = query.skip || 0
  const take = query.take || 100000000000
  const deviceIds = deviceIdsRes.slice(skip, skip + take)
  const geoFinish = now()
  const timeElapsed = geoFinish - geoStart
  logger.info(`mds-agency-cache readDevicesStatus bbox fetch ${JSON.stringify(bbox)} time elapsed: ${timeElapsed}ms`)

  const eventsStart = now()
  const events = ((await hreads(['event'], deviceIds)) as StringifiedEvent[])
    .reduce((acc: VehicleEvent[], item: StringifiedEventWithTelemetry) => {
      try {
        const parsedItem = parseEvent(item)
        if (
          EVENT_STATUS_MAP[parsedItem.event_type] === VEHICLE_STATUSES.removed ||
          !parsedItem.telemetry ||
          (strictChecking && !isInsideBoundingBox(parsedItem.telemetry, query.bbox))
        )
          return acc
        return [...acc, parsedItem]
      } catch (err) {
        return acc
      }
    }, [])
    .filter(item => Boolean(item))
  const eventsFinish = now()
  const eventsTimeElapsed = eventsFinish - eventsStart
  logger.info(
    `mds-agency-cache readDevicesStatus bbox check ${JSON.stringify(bbox)} time elapsed: ${eventsTimeElapsed}ms`
  )

  const devicesStart = now()
  const eventDeviceIds = events.map(event => event.device_id)
  const devices = (await hreads(['device'], eventDeviceIds))
    .reduce((acc: (Device | Telemetry | VehicleEvent)[], item: CachedItem) => {
      try {
        const parsedItem = parseCachedItem(item)
        return [...acc, parsedItem]
      } catch (err) {
        return acc
      }
    }, [])
    .filter(item => Boolean(item))
  const all = [...devices, ...events]
  const deviceStatusMap: { [device_id: string]: CachedItem | {} } = {}
  all.map(item => {
    deviceStatusMap[item.device_id] = deviceStatusMap[item.device_id] || {}
    Object.assign(deviceStatusMap[item.device_id], item)
  })
  const values = Object.values(deviceStatusMap)
  const valuesWithTelemetry = values.filter((item: any) => item.telemetry)
  const devicesFinish = now()
  const devicesTimeElapsed = devicesFinish - devicesStart
  logger.info(
    `mds-agency-cache readDevicesStatus device processing ${JSON.stringify(bbox)} time elapsed: ${devicesTimeElapsed}ms`
  )

  return valuesWithTelemetry
}

async function readTelemetry(device_id: UUID): Promise<Telemetry> {
  // logger.info('redis read telemetry for', device_id)
  const telemetry = await hread('telemetry', device_id)
  return parseTelemetry(telemetry as StringifiedTelemetry)
}

async function writeOneTelemetry(telemetry: Telemetry) {
  const { lat, lng } = telemetry.gps
  try {
    const prevTelemetry = await readTelemetry(telemetry.device_id)
    if (prevTelemetry.timestamp < telemetry.timestamp) {
      try {
        await addGeospatialHash(telemetry.device_id, [lat, lng])
        return hwrite('telemetry', telemetry)
      } catch (err) {
        logger.error('hwrite', err.stack)
        return Promise.reject(err)
      }
    } else {
      return Promise.resolve()
    }
  } catch (err) {
    logger.info('writeOneTelemetry: no prior telemetry found:', err.message)
    try {
      await addGeospatialHash(telemetry.device_id, [lat, lng])
      return hwrite('telemetry', telemetry)
    } catch (err2) {
      logger.error('writeOneTelemetry hwrite2', err.stack)
      return Promise.reject(err2)
    }
  }
}

async function writeTelemetry(telemetries: Telemetry[]) {
  await Promise.all(telemetries.map(telemetry => writeOneTelemetry(telemetry)))
}

async function readAllTelemetry() {
  // FIXME wildcard searching is slow
  const keys = await readKeys('device:*:telemetry')
  const device_ids = keys.map(key => {
    const [, device_id] = key.split(':')
    return device_id
  })
  return ((await hreads(['telemetry'], device_ids)) as StringifiedTelemetry[]).reduce((acc: Telemetry[], telemetry) => {
    try {
      return [...acc, parseTelemetry(telemetry)]
    } catch (err) {
      logger.info(JSON.parse(err))
      return acc
    }
  }, [])
}

async function seed(dataParam: { devices: Device[]; events: VehicleEvent[]; telemetry: Telemetry[] }) {
  logger.info('cache seed')
  const data = dataParam || {
    devices: [],
    events: [],
    telemetry: []
  }
  //  logger.info('cache seed redis', Object.keys(data).map(key => `${key} (${data[key].length})`))
  //  logger.info('cache seed redis', Object.keys(data).forEach(key => `${key} (${data[key].length})`))

  await data.devices.map(writeDevice)
  await data.events.map(writeEvent)
  if (data.telemetry.length !== 0) {
    await writeTelemetry(data.telemetry.sort((a, b) => a.timestamp - b.timestamp))
  }
  logger.info('cache seed redis done')
}

async function reset() {
  logger.info('cache reset')
  await client.flushdb()
  return logger.info('redis flushed')
}

async function initialize() {
  await getClient()
  await reset()
}

async function startup() {
  await getClient()
}

async function shutdown() {
  await client.shutdown()
}

async function health() {
  // FIXME
  return Promise.resolve('we good')
}

// remove stale keys, if any
// this was needed to clean up from failing to verify that a device was legit
async function cleanup() {
  try {
    const keys = await readKeys('device:*')
    logger.warn('cleanup: read', keys.length)
    const report: { telemetry: number; device: number; event: number; [suffix: string]: number } = {
      telemetry: 0,
      device: 0,
      event: 0
    }
    try {
      // look for bogus keys
      let badKeys: string[] = []
      keys.map(key => {
        const [, , suffix] = key.split(':')
        if (suffix) {
          badKeys.push(key)
          report[suffix] += 1
        }
      })
      // let's just purge a few as an experiment
      badKeys = badKeys.slice(0, 10000)
      const result = await client.del(...badKeys)
      // return a wee report
      report.deleted = result
      return report
    } catch (ex) {
      logger.error('cleanup: exception', ex)
      throw ex
    }
  } catch (ex) {
    logger.error('cleanup: exception', ex)
    return Promise.reject(ex)
  }
}

export default {
  initialize,
  health,
  info,
  seed,
  reset,
  startup,
  shutdown,
  writeDevice,
  writeEvent,
  writeOneTelemetry,
  writeTelemetry,
  readDevice,
  readDevices,
  readDeviceStatus,
  readDevicesStatus,
  readEvent,
  readEvents,
  readAllEvents,
  readTelemetry,
  readAllTelemetry,
  readKeys,
  wipeDevice,
  updateVehicleList,
  cleanup,
  getMostRecentEventByProvider
}
