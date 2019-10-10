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

import express from 'express'
import cache from '@mds-core/mds-cache'
import db from '@mds-core/mds-db'
import log from '@mds-core/mds-logger'
import {
  isUUID,
  now,
  days,
  pathsFor,
  getPolygon,
  pointInShape,
  isInStatesOrEvents,
  ServerError
} from '@mds-core/mds-utils'
import { Geography, Device, UUID, VehicleEvent } from '@mds-core/mds-types'
import { TEST1_PROVIDER_ID, TEST2_PROVIDER_ID, BLUE_SYSTEMS_PROVIDER_ID, providerName } from '@mds-core/mds-providers'
import { Geometry, FeatureCollection } from 'geojson'
import * as compliance_engine from './mds-compliance-engine'
import { ComplianceApiRequest, ComplianceApiResponse } from './types'

const AllowedProviderIDs = [TEST1_PROVIDER_ID, TEST2_PROVIDER_ID, BLUE_SYSTEMS_PROVIDER_ID]

function api(app: express.Express): express.Express {
  app.use(async (req: ComplianceApiRequest, res: ComplianceApiResponse, next: express.NextFunction) => {
    try {
      // verify presence of provider_id
      if (!(req.path.includes('/health') || req.path === '/')) {
        if (res.locals.claims) {
          const { provider_id } = res.locals.claims

          /* istanbul ignore next */
          if (!provider_id) {
            await log.warn('Missing provider_id in', req.originalUrl)
            return res.status(400).send({
              result: 'missing provider_id'
            })
          }

          /* istanbul ignore next */
          if (!isUUID(provider_id)) {
            await log.warn(req.originalUrl, 'invalid provider_id is not a UUID', provider_id)
            return res.status(400).send({
              result: `invalid provider_id ${provider_id} is not a UUID`
            })
          }

          // stash provider_id
          res.locals.provider_id = provider_id

          log.info(providerName(provider_id), req.method, req.originalUrl)
        } else {
          return res.status(401).send('Unauthorized')
        }
      }
    } catch (err) {
      /* istanbul ignore next */
      await log.error(req.originalUrl, 'request validation fail:', err.stack)
    }
    next()
  })

  app.get(pathsFor('/snapshot/:policy_uuid'), async (req: ComplianceApiRequest, res: ComplianceApiResponse) => {
    const { provider_id } = res.locals
    const { provider_id: queried_provider_id } = req.query

    /* istanbul ignore next */
    async function fail(err: Error) {
      await log.error(err.stack || err)
      return res.status(500).send(new ServerError())
    }

    const { policy_uuid } = req.params
    const { end_date: query_end_date } = req.query

    if (!isUUID(policy_uuid)) {
      return res.status(400).send({ err: 'bad_param' })
    }
    const { start_date, end_date } = query_end_date
      ? { end_date: parseInt(query_end_date), start_date: parseInt(query_end_date) - days(365) }
      : { end_date: now() + days(365), start_date: now() - days(365) }
    try {
      const all_policies = await db.readPolicies({ start_date })
      const policy = compliance_engine.filterPolicies(all_policies).find(p => {
        return p.policy_id === policy_uuid
      })
      if (!policy) {
        return res.status(404).send({ err: 'not found' })
      }

      if (
        policy &&
        ((policy.provider_ids && policy.provider_ids.includes(provider_id)) ||
          !policy.provider_ids ||
          (AllowedProviderIDs.includes(provider_id) &&
            ((policy.provider_ids &&
              policy.provider_ids.length !== 0 &&
              policy.provider_ids.includes(queried_provider_id)) ||
              !policy.provider_ids ||
              policy.provider_ids.length === 0)))
      ) {
        const target_provider_id = AllowedProviderIDs.includes(provider_id) ? queried_provider_id : provider_id
        if (
          compliance_engine
            .filterPolicies(all_policies)
            .map(p => p.policy_id)
            .includes(policy.policy_id)
        ) {
          const [geographies, deviceRecords] = await Promise.all([
            db.readGeographies(),
            db.readDeviceIds(target_provider_id)
          ])
          const deviceIdSubset = deviceRecords.map((record: { device_id: UUID; provider_id: UUID }) => record.device_id)
          const devices = await cache.readDevices(deviceIdSubset)
          const events =
            query_end_date && end_date < now()
              ? await db.readHistoricalEvents({ provider_id: target_provider_id, end_date })
              : await cache.readEvents(deviceIdSubset)

          const deviceMap = devices.reduce((map: { [d: string]: Device }, device) => {
            return device ? Object.assign(map, { [device.device_id]: device }) : map
          }, {})

          const filteredEvents = compliance_engine.filterEvents(events)
          const result = compliance_engine.processPolicy(policy, filteredEvents, geographies, deviceMap)
          if (result === undefined) {
            return res.status(400).send({ err: 'bad_param' })
          }
          return res.status(200).send(result)
        }
      } else {
        return res.status(401).send({ err: 'Unauthorized' })
      }
    } catch (err) {
      if (err.message.includes('not_found')) {
        return res.status(400).send({ err: 'bad_param' })
      }
      await fail(err)
    }
  })

  app.get(pathsFor('/count/:rule_id'), async (req: ComplianceApiRequest, res: ComplianceApiResponse) => {
    if (!AllowedProviderIDs.includes(res.locals.provider_id)) {
      return res.status(401).send({ result: 'unauthorized access' })
    }

    async function fail(err: Error) {
      await log.error(err.stack || err)
      if (err.message.includes('invalid rule_id')) {
        return res.status(404).send(err.message)
      }
      /* istanbul ignore next */
      return res
        .status(500)
        .send({ error: 'server_error', error_description: 'an internal server error has occurred and been logged' })
    }

    const { rule_id } = req.params
    try {
      const rule = await db.readRule(rule_id)
      const geography_ids = rule.geographies.reduce((acc: UUID[], geo: UUID) => {
        return [...acc, geo]
      }, [])
      const geographies = (await Promise.all(
        geography_ids.reduce((acc: Promise<Geography>[], geography_id) => {
          const geography = db.readSingleGeography(geography_id)
          return [...acc, geography]
        }, [])
      )).reduce((acc: Geography[], geos) => {
        return [...acc, geos]
      }, [])

      const polys = geographies.reduce((acc: (Geometry | FeatureCollection)[], geography) => {
        return [...acc, getPolygon(geographies, geography.geography_id)]
      }, [])

      // https://stackoverflow.com/a/51577579 to remove nulls in typesafe way
      const events = (await cache.readAllEvents()).filter(
        (event): event is VehicleEvent => event !== null && isInStatesOrEvents(rule, event)
      )
      const filteredEvents = compliance_engine.filterEvents(events)

      const count = filteredEvents.reduce((count_acc, event) => {
        return (
          count_acc +
          polys.reduce((poly_acc, poly) => {
            if (event.telemetry && pointInShape(event.telemetry.gps, poly)) {
              return poly_acc + 1
            }
            return poly_acc
          }, 0)
        )
      }, 0)

      return res.status(200).send({ count })
    } catch (err) {
      await fail(err)
    }
  })
  return app
}

export { api }
