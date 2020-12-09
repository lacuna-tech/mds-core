import supertest from 'supertest'
import HttpStatus from 'http-status-codes'
import { ApiServer } from '@mds-core/mds-api-server'
import { Policy } from '@mds-core/mds-types'
import { ComplianceServiceClient, ComplianceSnapshotDomainModel } from '@mds-core/mds-compliance-service'
import db from '@mds-core/mds-db'

import { ComplianceServiceManager } from '@mds-core/mds-compliance-service/service/manager'
import { pathPrefix, uuid } from '@mds-core/mds-utils'
import { SCOPED_AUTH } from '@mds-core/mds-test-data'
import { providers } from '@mds-core/mds-providers'
import {
  COMPLIANCE_SNAPSHOTS,
  TIME,
  PROVIDER_ID_2,
  PROVIDER_ID_1,
  POLICY_ID_1,
  POLICY_ID_2,
  POLICY1,
  POLICY2,
  COMPLIANCE_SNAPSHOTS_PROVIDER_2_POLICY_2,
  COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1,
  COMPLIANCE_SNAPSHOT_ID
} from './fixtures'
import { api } from '../api'

const request = supertest(ApiServer(api))

jest.mock('@mds-core/mds-utils', () => ({
  ...(jest.requireActual('@mds-core/mds-utils') as object)
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('@mds-core/mds-utils')

describe('Test Compliances API', () => {
  beforeEach(() => {
    jest.spyOn(utils, 'now').mockImplementation(() => TIME + 500)
    jest.spyOn(db, 'readActivePolicies').mockImplementation(
      async (): Promise<Policy[]> => {
        return [POLICY1, POLICY2]
      }
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /violation_periods', () => {
    it('parses all query params successfully, and users with the compliance:read scope can query for arbitrary providers', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshotsByTimeInterval')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1)
      await request
        .get(
          pathPrefix(
            `/violation_periods?start_time=${TIME}&provider_ids=${PROVIDER_ID_1},${PROVIDER_ID_2}&policy_ids=${POLICY_ID_1},${POLICY_ID_2}&end_time=${
              TIME + 500
            }`
          )
        )
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
      expect(clientSpy).toHaveBeenCalledWith({
        start_time: TIME,
        provider_ids: [PROVIDER_ID_1, PROVIDER_ID_2],
        policy_ids: [POLICY_ID_1, POLICY_ID_2],
        end_time: TIME + 500
      })
    })

    it('restricts the list of queried provider_ids to only the provider_id in the JWT for users with the compliance:read:provider scope', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshotsByTimeInterval')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1)
      await request
        .get(
          pathPrefix(
            `/violation_periods?start_time=${TIME}&provider_ids=${PROVIDER_ID_1},${PROVIDER_ID_2}&policy_ids=${POLICY_ID_1},${POLICY_ID_2}&end_time=${
              TIME + 500
            }`
          )
        )
        .set('Authorization', SCOPED_AUTH(['compliance:read:provider'], PROVIDER_ID_1))
      expect(clientSpy).toHaveBeenCalledWith({
        start_time: TIME,
        provider_ids: [PROVIDER_ID_1],
        policy_ids: [POLICY_ID_1, POLICY_ID_2],
        end_time: TIME + 500
      })
    })

    it('defaults to querying for all provider_ids if none are provided, and the scope is compliance:read', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshotsByTimeInterval')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1)
      await request
        .get(
          pathPrefix(
            `/violation_periods?start_time=${TIME}&policy_ids=${POLICY_ID_1},${POLICY_ID_2}&end_time=${TIME + 500}`
          )
        )
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
      expect(clientSpy).toHaveBeenCalledWith({
        start_time: TIME,
        provider_ids: Object.keys(providers),
        policy_ids: [POLICY_ID_1, POLICY_ID_2],
        end_time: TIME + 500
      })
    })

    it('Authorization fails without token', async () => {
      await request.get(pathPrefix(`/violation_periods?start_time=${TIME}`)).expect(HttpStatus.FORBIDDEN)
    })

    it('Authorization fails with compliance:read:scope and no provider_id', async () => {
      await request
        .get(pathPrefix(`/violation_periods?start_time=${TIME}`))
        .set('Authorization', SCOPED_AUTH(['compliance:read:provider'], ''))
        .expect(HttpStatus.FORBIDDEN)
    })

    it('Accurately breaks compliance snapshots into violation periods for one provider', async () => {
      jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshotsByTimeInterval')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_2_POLICY_2)
      await request
        .get(pathPrefix(`/violation_periods?start_time=${TIME}`))
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
        .expect(HttpStatus.OK, {
          version: '1.1.0',
          start_time: TIME,
          end_time: TIME + 500,
          results: [
            {
              provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3',
              provider_name: 'Lime',
              policy_id: 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387',
              violation_periods: [
                {
                  start_time: 1605821758035,
                  end_time: 1605821758036,
                  snapshots_uri: 'ba636406-1898-49a0-b937-6f825b789ee0,8cb4d0a8-5edc-46f6-a4e4-a40f5a5f4558'
                },
                {
                  start_time: 1605821758038,
                  end_time: 1605821758038,
                  snapshots_uri: '3a11150b-5d64-4638-bd2d-745905ed8294'
                }
              ]
            }
          ]
        })
    })

    it('Accurately breaks compliance snapshots into violation periods for multiple providers and policies', async () => {
      jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshotsByTimeInterval')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS)
      await request
        .get(pathPrefix(`/violation_periods?start_time=${TIME}`))
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
        .expect(HttpStatus.OK, {
          version: '1.1.0',
          start_time: TIME,
          end_time: TIME + 500,
          results: [
            {
              provider_id: 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0',
              policy_id: '6d7a9c7e-853c-4ff7-a86f-e17c06d3bd80',
              provider_name: 'JUMP',
              violation_periods: [
                {
                  start_time: 1605821758034,
                  end_time: 1605821758034,
                  snapshots_uri: '243e1209-61ad-4d7c-8464-db551f1f8c21'
                }
              ]
            },
            {
              provider_id: 'c20e08cf-8488-46a6-a66c-5d8fb827f7e0',
              policy_id: 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387',
              provider_name: 'JUMP',
              violation_periods: []
            },
            {
              provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3',
              policy_id: 'dfe3f757-c43a-4eb6-b85e-abc00f3e8387',
              provider_name: 'Lime',
              violation_periods: [
                {
                  start_time: 1605821758035,
                  end_time: 1605821758036,
                  snapshots_uri: 'ba636406-1898-49a0-b937-6f825b789ee0,8cb4d0a8-5edc-46f6-a4e4-a40f5a5f4558'
                },
                {
                  start_time: 1605821758038,
                  end_time: 1605821758038,
                  snapshots_uri: '3a11150b-5d64-4638-bd2d-745905ed8294'
                }
              ]
            },
            {
              provider_id: '63f13c48-34ff-49d2-aca7-cf6a5b6171c3',
              policy_id: '6d7a9c7e-853c-4ff7-a86f-e17c06d3bd80',
              provider_name: 'Lime',
              violation_periods: [
                {
                  start_time: 1605821758036,
                  end_time: 1605821758036,
                  snapshots_uri: '39e2171b-a9df-417c-b218-2a82b491a0cc'
                }
              ]
            }
          ]
        })
    })
  })

  describe.only('GET /violation_details_snapshot', () => {
    it.only('successfully uses the compliance_snapshot_id if provided', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshot')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1[0])
      const result = await request
        .get(
          pathPrefix(
            `/violation_details_snapshot?compliance_snapshot_id=${COMPLIANCE_SNAPSHOT_ID}&policy_id=${POLICY_ID_1}`
          )
        )
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
      console.log('rezz', result.error)
      //        .expect(HttpStatus.OK)

      expect(clientSpy).toHaveBeenCalledWith({
        compliance_snapshot_id: COMPLIANCE_SNAPSHOT_ID
      })
    })

    it('successfully uses a combo of compliance_as_of, provider_id, and policy_id', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshot')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1[0])
      await request
        .get(
          pathPrefix(
            `/violation_details_snapshot?policy_id=${POLICY_ID_1}&provider_id=${PROVIDER_ID_1}&compliance_as_of=${TIME}`
          )
        )
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
        .expect(HttpStatus.OK)

      expect(clientSpy).toHaveBeenCalledWith({
        policy_id: POLICY_ID_1,
        provider_id: PROVIDER_ID_1,
        compliance_as_of: TIME
      })
    })

    it('compliance_as_of defaults to now()', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshot')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1[0])
      await request
        .get(pathPrefix(`/violation_details_snapshot?policy_id=${POLICY_ID_1}&provider_id=${PROVIDER_ID_1}`))
        .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))
        .expect(HttpStatus.OK)

      expect(clientSpy).toHaveBeenCalledWith({
        policy_id: POLICY_ID_1,
        provider_id: PROVIDER_ID_1,
        compliance_as_of: TIME + 500
      })
    })

    it('uses the provider_id in the JWT claim with compliance:read:provider scope', async () => {
      const clientSpy = jest
        .spyOn(ComplianceServiceClient, 'getComplianceSnapshot')
        .mockImplementation(async () => COMPLIANCE_SNAPSHOTS_PROVIDER_1_POLICY_1[0])
      await request
        .get(pathPrefix(`/violation_details_snapshot?policy_id=${POLICY_ID_1}&provider_id=${PROVIDER_ID_2}`))
        .set('Authorization', SCOPED_AUTH(['compliance:read:provider'], PROVIDER_ID_1))
        .expect(HttpStatus.OK)

      expect(clientSpy).toHaveBeenCalledWith({
        policy_id: POLICY_ID_1,
        provider_id: PROVIDER_ID_1,
        compliance_as_of: TIME + 500
      })
    })

    it('returns an error if the provider_id in the JWT claim is missing', async () => {
      await request
        .get(pathPrefix(`/violation_details_snapshot?policy_id=${POLICY_ID_1}&provider_id=${PROVIDER_ID_2}`))
        .set('Authorization', SCOPED_AUTH(['compliance:read:provider'], ''))
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('returns an error if the policy_id and compliance_snapshot_id are both missing', async () => {
      await request
        .get(pathPrefix(`/violation_details_snapshot?`))
        .set('Authorization', SCOPED_AUTH(['compliance:read:provider'], PROVIDER_ID_1))
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
