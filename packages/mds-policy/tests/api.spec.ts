/**
 * Copyright 2019 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// eslint directives:
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable no-plusplus */
/* eslint-disable no-useless-concat */
/* eslint-disable prefer-destructuring */

import supertest from 'supertest'
import test from 'unit.js'
import { now, days, clone, yesterday, pathPrefix } from '@mds-core/mds-utils'
import { ApiServer } from '@mds-core/mds-api-server'
import { TEST1_PROVIDER_ID } from '@mds-core/mds-providers'
import { ModalityPolicy, ModalityPolicyTypeInfo } from '@mds-core/mds-types'
import db from '@mds-core/mds-db'
import {
  POLICY_JSON,
  POLICY2_JSON,
  POLICY3_JSON,
  POLICY4_JSON,
  SUPERSEDING_POLICY_JSON,
  POLICY_UUID,
  POLICY2_UUID,
  GEOGRAPHY_UUID,
  START_ONE_MONTH_AGO,
  START_ONE_WEEK_AGO,
  PROVIDER_SCOPES,
  GEOGRAPHY2_UUID,
  veniceSpecOps,
  SCOPED_AUTH,
  START_ONE_MONTH_FROM_NOW,
  LA_CITY_BOUNDARY
} from '@mds-core/mds-test-data'

import { api } from '../api'
import { POLICY_API_DEFAULT_VERSION } from '../types'
/* eslint-disable-next-line @typescript-eslint/no-var-requires */

/* eslint-disable-next-line no-console */
const log = console.log.bind(console)

const request = supertest(ApiServer<ModalityPolicyTypeInfo>(api))

const ACTIVE_POLICY_JSON = clone(POLICY_JSON)
ACTIVE_POLICY_JSON.publish_date = yesterday()
ACTIVE_POLICY_JSON.start_date = yesterday()

const ACTIVE_MONTH_OLD_POLICY_JSON = clone(POLICY2_JSON)
ACTIVE_MONTH_OLD_POLICY_JSON.publish_date = START_ONE_MONTH_FROM_NOW
const APP_JSON = 'application/vnd.mds.policy+json; charset=utf-8; version=0.4'

const AUTH = `basic ${Buffer.from(`${TEST1_PROVIDER_ID}|${PROVIDER_SCOPES}`).toString('base64')}`
const POLICIES_READ_SCOPE = SCOPED_AUTH(['policies:read'])

describe('Tests app', () => {
  before('Initialize the DB', async () => {
    await db.reinitialize()
    await db.writeGeography({ name: 'Los Angeles', geography_id: GEOGRAPHY_UUID, geography_json: LA_CITY_BOUNDARY })
  })

  after('Shutdown the DB', async () => {
    await db.shutdown()
  })

  it('tries to get policy for invalid dates', async () => {
    const result = await request
      .get(pathPrefix('/policies?start_date=100000&end_date=100'))
      .set('Authorization', AUTH)
      .expect(400)
    test.value(result.body.result === 'start_date after end_date')
  })

  it('read back one policy', async () => {
    await db.writePolicy(ACTIVE_POLICY_JSON)
    await db.publishGeography({ geography_id: GEOGRAPHY_UUID })
    const result = await request
      .get(pathPrefix(`/policies/${POLICY_UUID}`))
      .set('Authorization', AUTH)
      .expect(200)
    const body = result.body
    log('read back one policy response:', body)
    test.value(body.version).is(POLICY_API_DEFAULT_VERSION)
    test.value(result).hasHeader('content-type', APP_JSON)
    test.value(result.body.data.policy.policies, POLICY_UUID)
  })

  it('reads back all active policies', async () => {
    const result = await request.get(pathPrefix(`/policies`)).set('Authorization', AUTH).expect(200)
    const body = result.body
    log('read back all policies response:', body)
    test.value(body.data.policies.length).is(1) // only one should be currently valid
    test.value(body.data.policies[0].policy_id).is(POLICY_UUID)
    test.value(body.version).is(POLICY_API_DEFAULT_VERSION)
    test.value(result).hasHeader('content-type', APP_JSON)
    test.value(result.body.data.policies, [ACTIVE_POLICY_JSON])
  })

  it('read back all published policies and no superseded ones', async () => {
    await db.writeGeography({
      name: 'Los Angeles',
      geography_id: GEOGRAPHY2_UUID,
      geography_json: veniceSpecOps
    })
    await db.writePolicy(ACTIVE_MONTH_OLD_POLICY_JSON)
    await db.publishGeography({ geography_id: GEOGRAPHY_UUID })
    await db.publishGeography({ geography_id: GEOGRAPHY2_UUID })
    await db.writePolicy(POLICY3_JSON)
    await db.publishPolicy(POLICY3_JSON.policy_id, POLICY3_JSON.start_date)
    await db.writePolicy(SUPERSEDING_POLICY_JSON)
    await db.publishPolicy(SUPERSEDING_POLICY_JSON.policy_id, SUPERSEDING_POLICY_JSON.start_date)
    const result = await request
      .get(pathPrefix(`/policies?start_date=${now() - days(365)}&end_date=${now() + days(365)}`))
      .set('Authorization', AUTH)
      .expect(200)
    const body = result.body
    const policies = result.body.data.policies
    log('read back all published policies response:', body)
    test.value(policies.length).is(3)
    test.value(body.version).is(POLICY_API_DEFAULT_VERSION)
    test.value(result).hasHeader('content-type', APP_JSON)
    const isSupersededPolicyPresent = policies.some((policy: ModalityPolicy) => {
      return policy.policy_id === ACTIVE_POLICY_JSON.policy_id
    })
    const isSupersedingPolicyPresent = policies.some((policy: ModalityPolicy) => {
      return policy.policy_id === SUPERSEDING_POLICY_JSON.policy_id
    })
    test.value(isSupersededPolicyPresent).is(false)
    test.value(isSupersedingPolicyPresent).is(true)
  })

  it('read back an old policy', async () => {
    const result = await request
      .get(pathPrefix(`/policies?start_date=${START_ONE_MONTH_AGO}&end_date=${START_ONE_WEEK_AGO}`))
      .set('Authorization', AUTH)
      .expect(200)
    const body = result.body
    const policies = body.data.policies
    log('read back all policies response:', body)
    test.value(policies.length).is(1) // only one
    test.value(policies[0].policy_id).is(POLICY2_UUID)
    test.value(body.version).is(POLICY_API_DEFAULT_VERSION)
    test.value(result).hasHeader('content-type', APP_JSON)
  })

  it('read back current and future policies', async () => {
    const result = await request
      .get(pathPrefix(`/policies?end_date=${now() + days(365)}`))
      .set('Authorization', AUTH)
      .expect(200)
    const body = result.body
    log('read back all policies response:', body)
    test.value(body.data.policies.length).is(2) // current and future
    test.value(body.version).is(POLICY_API_DEFAULT_VERSION)
    test.value(result).hasHeader('content-type', APP_JSON)
  })

  it('cannot GET a nonexistent policy', async () => {
    const result = await request
      .get(pathPrefix(`/policies/${GEOGRAPHY_UUID}`)) // obvs not a policy
      .set('Authorization', AUTH)
      .expect(404)
    const body = result.body
    log('read back nonexistent policy response:', body)
    test.value(result).hasHeader('content-type', APP_JSON)
  })

  it('tries to read non-UUID policy', async () => {
    const result = await request.get(pathPrefix('/policies/notarealpolicy')).set('Authorization', AUTH).expect(400)
    test.value(result.body.result === 'not found')
  })

  it('can GET all unpublished policies', async () => {
    await db.writePolicy(POLICY4_JSON)
    const result = await request
      .get(pathPrefix(`/policies?get_unpublished=true`))
      .set('Authorization', POLICIES_READ_SCOPE)
      .expect(200)
    test.assert(result.body.data.policies.length === 1)
  })

  it('can GET one unpublished policy', async () => {
    await request
      .get(pathPrefix(`/policies/${POLICY4_JSON.policy_id}?get_unpublished=true`))
      .set('Authorization', POLICIES_READ_SCOPE)
      .expect(200)
  })

  it('fails to hit non-existent endpoint with a 404', done => {
    request
      .get(pathPrefix(`/foobar`))
      .set('Authorization', POLICIES_READ_SCOPE)
      .expect(404)
      .end(err => {
        done(err)
      })
  })
})
