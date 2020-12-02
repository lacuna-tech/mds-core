import supertest from 'supertest'
import HttpStatus from 'http-status-codes'
import { ApiServer } from '@mds-core/mds-api-server'
import { ComplianceServiceClient } from '@mds-core/mds-compliance-service/client'
import { ComplianceServiceManager } from '@mds-core/mds-compliance-service/service/manager'
import { pathPrefix, uuid } from '@mds-core/mds-utils'
import { SCOPED_AUTH } from '@mds-core/mds-test-data'
import { COMPLIANCE_SNAPSHOTS, TIME, PROVIDER_ID_2, PROVIDER_ID_1, POLICY_ID_1, POLICY_ID_2 } from './fixtures'
import { api } from '../api'

const request = supertest(ApiServer(api))
const ComplianceServer = ComplianceServiceManager.controller()

describe('Test Compliances API', () => {
  beforeAll(async () => {
    await ComplianceServer.start()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Runs a test', async () => {
    jest
      .spyOn(ComplianceServiceClient, 'getComplianceSnapshotsByTimeInterval')
      .mockImplementation(async () => COMPLIANCE_SNAPSHOTS)
    const result = await request
      .get(pathPrefix(`/violation_periods?start_time=${TIME}`))
      .set('Authorization', SCOPED_AUTH(['compliance:read'], ''))

    console.log('rezz', result.error)
  })

  afterAll(async () => {
    await ComplianceServer.stop()
  })
})
