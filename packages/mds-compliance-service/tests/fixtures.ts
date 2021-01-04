import { now, days, uuid } from '@mds-core/mds-utils'
import { ComplianceSnapshotDomainModel } from '../@types'

export const TIME = now()
export const COMPLIANCE_SNAPSHOT_ID = 'ec3706e4-9cfd-48d7-8330-150fc733e7e0'
export const PROVIDER_ID = 'aa777467-be73-4710-9c4c-e0bea5dd3ac8'
export const POLICY_ID = 'afc11dfe-3b0c-473b-9874-0c372909df73'
export const COMPLIANCE_SNAPSHOT: ComplianceSnapshotDomainModel = {
  policy: {
    name: 'a dummy',
    policy_id: POLICY_ID
  },
  provider_id: PROVIDER_ID,
  compliance_as_of: TIME,
  compliance_snapshot_id: COMPLIANCE_SNAPSHOT_ID,
  vehicles_found: [
    {
      device_id: '170e2ac5-c786-405a-bef7-ae15c89b3e53',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: TIME,
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.18319703595646, lng: -118.45538981769323 }
    },
    {
      device_id: 'e18a7f26-e3eb-4320-b82d-9b7f8af181e2',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: TIME,
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.18541489229653, lng: -118.53515310658483 }
    },
    {
      device_id: 'f99b08a0-79b3-4250-b76f-667b378334fe',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: TIME,
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.22541868137434, lng: -118.40034283985302 }
    }
  ],
  excess_vehicles_count: 3,
  total_violations: 3
}

export const COMPLIANCE_SNAPSHOT_1: ComplianceSnapshotDomainModel = {
  policy: {
    name: 'a dummy',
    policy_id: 'afc11dfe-3b0c-473b-9874-0c372909df73'
  },
  provider_id: 'aa777467-be73-4710-9c4c-e0bea5dd3ac8',
  compliance_as_of: now() + days(1),
  compliance_snapshot_id: uuid(),
  vehicles_found: [
    {
      device_id: '170e2ac5-c786-405a-bef7-ae15c89b3e53',
      state: 'on_trip',
      event_types: ['trip_start'],
      timestamp: now() + days(1),
      rules_matched: ['47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6'],
      rule_applied: '47c8c7d4-14b5-43a3-b9a5-a32ecc2fb2c6',
      speed: undefined,
      gps: { lat: 34.18319703595646, lng: -118.45538981769323 }
    }
  ],
  excess_vehicles_count: 1,
  total_violations: 1
}
