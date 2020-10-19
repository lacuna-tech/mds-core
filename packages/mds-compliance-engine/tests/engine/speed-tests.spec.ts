import test from 'unit.js'

import { makeDevices, makeEventsWithTelemetry } from '@mds-core/mds-test-data'
import { Geography, Policy, Device, SpeedRule, Telemetry, VehicleEvent } from '@mds-core/mds-types'

import { la_city_boundary } from '@mds-core/mds-policy/tests/la-city-boundary'
import { FeatureCollection } from 'geojson'
import { isSpeedRuleMatch, processSpeedPolicy } from '../../engine/speed_processors'
import { getRecentEvents } from '../../engine/helpers'
import { generateDeviceMap } from './helpers'
import { ComplianceResult, MatchedVehicleInformation, VehicleEventWithTelemetry } from '../../@types'

const SPEED_POLICY: Policy = {
  policy_id: '95645117-fd85-463e-a2c9-fc95ea47463e',
  name: 'Speed Limits',
  description: 'LADOT Pilot Speed Limit Limitations',
  start_date: 1552678594428,
  end_date: null,
  prev_policies: null,
  provider_ids: [],
  rules: [
    {
      name: 'Greater LA',
      rule_id: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
      rule_type: 'speed',
      rule_units: 'mph',
      geographies: ['1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'],
      states: {
        on_trip: []
      },
      vehicle_types: ['bicycle', 'scooter'],
      maximum: 15
    }
  ]
}

const CITY_OF_LA = '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49'

const geographies: Geography[] = [
  { name: 'la', geography_id: CITY_OF_LA, geography_json: la_city_boundary as FeatureCollection }
]

process.env.TIMEZONE = 'America/Los_Angeles'

function now(): number {
  return Date.now()
}

describe('Tests Compliance Engine Speed Violations', () => {
  it('Verifies speed compliance', done => {
    const devices = makeDevices(5, now())
    const events = makeEventsWithTelemetry(devices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 5
    }) as VehicleEventWithTelemetry[]

    const deviceMap: { [d: string]: Device } = generateDeviceMap(devices)

    const result = processSpeedPolicy(SPEED_POLICY, events, geographies, deviceMap) as ComplianceResult
    test.assert.deepEqual(result.total_violations, 0)
    test.assert.deepEqual(result.vehicles_found, [])
    done()
  })

  it('verifies speed compliance violation', done => {
    const devicesA = makeDevices(5, now())
    const eventsA = makeEventsWithTelemetry(devicesA, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })
    const devicesB = makeDevices(5, now())
    const eventsB = makeEventsWithTelemetry(devicesB, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 1
    })

    const recentEvents = getRecentEvents([...eventsA, ...eventsB])
    const deviceMap: { [d: string]: Device } = generateDeviceMap([...devicesA, ...devicesB])

    const result = processSpeedPolicy(
      SPEED_POLICY,
      recentEvents as (VehicleEvent & { telemetry: Telemetry })[],
      geographies,
      deviceMap
    ) as ComplianceResult
    test.assert.deepEqual(result.vehicles_found.length, 5)
    test.assert.deepEqual(result.total_violations, 5)
    const { rule_id } = SPEED_POLICY.rules[0]
    // Note that for speed rule matches, `rule_applied` is never null.
    const speedingCount = result.vehicles_found.reduce((count: number, vehicle: MatchedVehicleInformation) => {
      if (vehicle.rule_applied === rule_id && vehicle.rules_matched.includes(rule_id)) {
        // eslint-disable-next-line no-param-reassign
        count += 1
      }
      return count
    }, 0)
    test.assert.deepEqual(speedingCount, 5)
    done()
  })

  it('Verifies isSpeedRuleMatch', done => {
    const speedingDevices = makeDevices(1, now())
    const speedingEvents = makeEventsWithTelemetry(speedingDevices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 500
    })

    const nonSpeedingDevices = makeDevices(1, now())
    const nonSpeedingEvents = makeEventsWithTelemetry(nonSpeedingDevices, now(), CITY_OF_LA, {
      event_types: ['trip_start'],
      vehicle_state: 'on_trip',
      speed: 14
    })

    const rule = SPEED_POLICY.rules[0] as SpeedRule

    test.assert(
      isSpeedRuleMatch(
        rule,
        geographies,
        speedingDevices[0],
        speedingEvents[0] as VehicleEvent & { telemetry: Telemetry }
      )
    )

    test.assert(
      !isSpeedRuleMatch(
        rule,
        geographies,
        nonSpeedingDevices[0],
        nonSpeedingEvents[0] as VehicleEvent & { telemetry: Telemetry }
      )
    )
    done()
  })
})