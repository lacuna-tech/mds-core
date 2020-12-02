import { ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import { now } from '@mds-core/mds-utils'

export const POLICY_ID_1 = '6d7a9c7e-853c-4ff7-a86f-e17c06d3bd80'
export const POLICY_ID_2 = 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387'
export const PROVIDER_ID_1 = 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0'
export const PROVIDER_ID_2 = '63f13c48-34ff-49d2-aca7-cf6a5b6171c3'

export const TIME = now() - 60 * 60 * 1000

export const COMPLIANCE_SNAPSHOTS: ComplianceSnapshotDomainModel[] = [
  {
    compliance_as_of: TIME,
    compliance_snapshot_id: '243e1209-61ad-4d7c-8464-db551f1f8c21',
    excess_vehicles_count: 1,
    total_violations: 1,
    policy: {
      name: 'Very Low Count Limit',
      policy_id: POLICY_ID_1
    },
    provider_id: PROVIDER_ID_1,
    vehicles_found: [
      {
        device_id: 'f7cf9bbf-0f9e-4497-ab3f-d7358458f939',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758034,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.073398166515325, lng: -118.25991238180214 }
      }
    ]
  },
  {
    compliance_as_of: TIME + 2,
    compliance_snapshot_id: '39e2171b-a9df-417c-b218-2a82b491a0cc',
    excess_vehicles_count: 6,
    total_violations: 6,
    policy: {
      name: 'Very Low Count Limit',
      policy_id: POLICY_ID_1
    },
    provider_id: PROVIDER_ID_2,
    vehicles_found: [
      {
        device_id: 'f7cf9bbf-0f9e-4497-ab3f-d7358458f939',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758034,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.073398166515325, lng: -118.25991238180214 }
      },
      {
        device_id: '31769883-ef60-4323-8360-6b20cda01c96',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758044,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.24153417305256, lng: -118.43052998931205 }
      },
      {
        device_id: 'a760d84c-4f6d-433c-a436-6a3abfa6e968',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758054,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.260129152395635, lng: -118.31228131867269 }
      },
      {
        device_id: '1335f779-c981-4b67-b6d6-d55a74259747',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758064,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.214306602581544, lng: -118.4785189578198 }
      },
      {
        device_id: 'ad81ba8b-0f09-43e1-8c4b-26f2437412b0',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758074,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.172787102332386, lng: -118.50261403617911 }
      },
      {
        device_id: '40823011-0a94-41e8-91f1-99e4ddaf2973',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758084,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: undefined,
        speed: undefined,
        gps: { lat: 34.32580482727351, lng: -118.46685950142516 }
      }
    ]
  },
  {
    compliance_as_of: TIME + 1,
    compliance_snapshot_id: 'ba636406-1898-49a0-b937-6f825b789ee0',
    excess_vehicles_count: 0,
    total_violations: 0,
    policy: {
      name: 'Another Low Count Limit',
      policy_id: POLICY_ID_2
    },
    provider_id: PROVIDER_ID_1,
    vehicles_found: []
  },
  {
    compliance_as_of: TIME + 1,
    compliance_snapshot_id: 'ba636406-1898-49a0-b937-6f825b789ee0',
    excess_vehicles_count: 1,
    total_violations: 1,
    policy: {
      name: 'Another Low Count Limit',
      policy_id: POLICY_ID_2
    },
    provider_id: PROVIDER_ID_2,
    vehicles_found: [
      {
        device_id: 'f7cf9bbf-0f9e-4497-ab3f-d7358458f939',
        state: 'on_trip',
        event_types: ['trip_start'],
        timestamp: 1605821758034,
        rules_matched: ['2aa6953d-fa8f-4018-9b54-84c8b4b83c6d'],
        rule_applied: '2aa6953d-fa8f-4018-9b54-84c8b4b83c6d',
        speed: undefined,
        gps: { lat: 34.073398166515325, lng: -118.25991238180214 }
      }
    ]
  }
]
