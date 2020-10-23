import test from 'unit.js'

import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { Device, Geography, Policy, VehicleEvent } from '@mds-core/mds-types'
import cache from '@mds-core/mds-agency-cache'

import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { FeatureCollection } from 'geojson'
import db from '@mds-core/mds-db'
import assert from 'assert'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import { EXPIRED_POLICY, LOW_COUNT_POLICY } from '../../test_data/fixtures'
import { NewComplianceResponse, VehicleEventWithTelemetry } from '../../@types'
import { processPolicy } from '../../engine/mds-compliance-engine'
import { getSupersedingPolicies, getEvents } from '../../engine/helpers'
import { readJson } from './helpers'

let policies: Policy[] = []

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

const geographies: Geography[] = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }
]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests General Compliance Engine Functionality', () => {
  before(async () => {
    policies = await readJson('test_data/policies.json')
  })

  beforeEach(async () => {
    await db.initialize()
    await cache.reset()
  })

  it('Verifies not considering events older than 48 hours', async () => {
    const TWO_DAYS_IN_MS = 172800000
    const curTime = now()
    const devices = makeDevices(400, curTime)
    const events = makeEventsWithTelemetry(devices, curTime - TWO_DAYS_IN_MS, CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })
    await cache.seed({ devices, events, telemetry: [] })
    await Promise.all(devices.map(async device => db.writeDevice(device)))

    // make sure this helper works
    const recentEvents = getEvents(events) as VehicleEventWithTelemetry[]
    test.assert.deepEqual(recentEvents.length, 0)

    // Mimic what we do in the real world to get inputs to feed into the compliance engine.
    const supersedingPolicies = getSupersedingPolicies(policies)

    const policyResults = await Promise.all(supersedingPolicies.map(async policy => processPolicy(policy, geographies)))
    policyResults.forEach(complianceResponses => {
      complianceResponses.forEach(complianceResponse => {
        test.assert.deepEqual(complianceResponse?.vehicles_found.length, 0)
      })
    })
  })

  it('does not run inactive policies', async () => {
    const devices = makeDevices(400, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 4
    })
    await cache.seed({ devices, events, telemetry: [] })
    await Promise.all(devices.map(async device => db.writeDevice(device)))
    const result = await processPolicy(EXPIRED_POLICY, geographies)
    test.assert.deepEqual(result, [])
  })
})

describe('Verifies compliance engine processes by vehicle most recent event', () => {
  beforeEach(async () => {
    await db.initialize()
    await cache.reset()
  })
  it('should process count violation vehicles with the most recent event last', async () => {
    const devices = makeDevices(6, now())
    const start_time = now() - 10000000
    const latest_device: Device = devices[0]
    const events = devices.reduce((events_acc: VehicleEvent[], device: Device, current_index) => {
      const device_events = makeEventsWithTelemetry([device], start_time - current_index * 10, CITY_OF_LA, {
        event_types: ['trip_start'],
        vehicle_state: 'on_trip',
        speed: 0
      })
      events_acc.push(...device_events)
      return events_acc
    }, []) as VehicleEventWithTelemetry[]
    await cache.seed({ devices, events, telemetry: [] })
    await Promise.all(devices.map(async device => db.writeDevice(device)))
    const complianceResults = await processPolicy(LOW_COUNT_POLICY, geographies)
    const { 0: result } = complianceResults.filter(
      complianceResult => complianceResult?.provider_id === TEST1_PROVIDER_ID
    ) as NewComplianceResponse[]
    test.assert.deepEqual(result.total_violations, 1)
    const { 0: device } = result.vehicles_found.filter(vehicle => {
      return !vehicle.rule_applied
    })
    test.assert.deepEqual(latest_device.device_id, device.device_id)
  })
})

describe('Verifies errors are being properly thrown', async () => {
  it('Verifies RuntimeErrors are being thrown with an invalid TIMEZONE env_var', async () => {
    const oldTimezone = process.env.TIMEZONE
    process.env.TIMEZONE = 'Pluto/Potato_Land'
    const devices = makeDevices(1, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_end'],
      vehicle_state: 'available',
      speed: 0
    })

    await cache.seed({ devices, events, telemetry: [] })
    await Promise.all(devices.map(async device => db.writeDevice(device)))

    await assert.rejects(
      async () => {
        await processPolicy(policies[0], geographies)
      },
      { name: 'RuntimeError' }
    )
    process.env.TIMEZONE = oldTimezone
  })
})
