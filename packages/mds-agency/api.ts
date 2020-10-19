/*
    LICENSE
    https://github.com/openmobilityfoundation/mobility-data-specification/blob/master/LICENSE
 */

import express from 'express'

import logger from '@mds-core/mds-logger'
import { isProviderId } from '@mds-core/mds-providers'
import { isUUID, pathPrefix } from '@mds-core/mds-utils'
import { checkAccess, AccessTokenScopeValidator } from '@mds-core/mds-api-server'
import { AgencyApiRequest, AgencyApiResponse, AgencyApiAccessTokenScopes } from './types'
import {
  initialize,
  registerVehicle,
  getVehicleById,
  getVehiclesByProvider,
  updateVehicle,
  submitVehicleEvent,
  submitVehicleTelemetry,
  registerStop,
  readStop,
  readStops
} from './request-handlers'
import { readAllVehicleIds } from './agency-candidate-request-handlers'
import { getCacheInfo, wipeDevice, refreshCache } from './sandbox-admin-request-handlers'
import { validateDeviceId } from './utils'

import { AgencyApiVersionMiddleware } from './middleware/agency-api-version'

const checkAgencyApiAccess = (validator: AccessTokenScopeValidator<AgencyApiAccessTokenScopes>) =>
  checkAccess(validator)

function api(app: express.Express): express.Express {
  /**
   * Agency-specific middleware to extract provider_id into locals, do some logging, etc.
   */
  app.use(AgencyApiVersionMiddleware)

  app.use(async (req: AgencyApiRequest, res: AgencyApiResponse, next) => {
    try {
      // verify presence of provider_id
      if (!req.path.includes('/health')) {
        if (res.locals.claims) {
          const { provider_id } = res.locals.claims

          if (!isUUID(provider_id)) {
            logger.warn(req.originalUrl, 'invalid provider_id is not a UUID', provider_id)
            return res.status(400).send({
              error: 'authentication_error',
              error_description: `invalid provider_id ${provider_id} is not a UUID`
            })
          }

          if (!isProviderId(provider_id)) {
            return res.status(400).send({
              error: 'authentication_error',
              error_description: `invalid provider_id ${provider_id} is not a known provider`
            })
          }

          // stash provider_id
          res.locals.provider_id = provider_id

          // logger.info(providerName(provider_id), req.method, req.originalUrl)
        } else {
          return res.status(401).send({ error: 'authentication_error', error_description: 'Unauthorized' })
        }
      }
    } catch (err) {
      /* istanbul ignore next */
      logger.error(req.originalUrl, 'request validation fail:', err.stack)
    }
    next()
  })

  // / ////////// gets ////////////////

  /**
   * Endpoint to register vehicles
   * See {@link https://github.com/openmobilityfoundation/mobility-data-specification/tree/dev/agency#vehicle---register Register}
   */
  app.post(pathPrefix('/vehicles'), registerVehicle)

  /**
   * Read back a vehicle.
   */
  app.get(pathPrefix('/vehicles/:device_id'), validateDeviceId, getVehicleById)

  /**
   * Read back all the vehicles for this provider_id, with pagination
   */
  app.get(pathPrefix('/vehicles'), getVehiclesByProvider)

  // update the vehicle_id
  app.put(pathPrefix('/vehicles/:device_id'), validateDeviceId, updateVehicle)

  /**
   * Endpoint to submit vehicle events
   * See {@link https://github.com/openmobilityfoundation/mobility-data-specification/tree/dev/agency#vehicle---event Events}
   */
  app.post(pathPrefix('/vehicles/:device_id/event'), validateDeviceId, submitVehicleEvent)

  /**
   * Endpoint to submit telemetry
   * See {@link https://github.com/openmobilityfoundation/mobility-data-specification/tree/dev/agency#vehicles---update-telemetry Telemetry}
   */
  app.post(pathPrefix('/vehicles/telemetry'), submitVehicleTelemetry)

  // ///////////////////// begin Agency candidate endpoints ///////////////////////

  /**
   * Not currently in Agency spec.  Ability to read back all vehicle IDs.
   */
  app.get(
    pathPrefix('/admin/vehicle_ids'),
    checkAgencyApiAccess(scopes => scopes.includes('admin:all')),
    readAllVehicleIds
  )

  // /////////////////// end Agency candidate endpoints ////////////////////

  app.get(
    pathPrefix('/admin/cache/info'),
    checkAgencyApiAccess(scopes => scopes.includes('admin:all')),
    getCacheInfo
  )

  // wipe a device -- sandbox or admin use only
  app.get(
    pathPrefix('/admin/wipe/:device_id'),
    checkAgencyApiAccess(scopes => scopes.includes('admin:all')),
    validateDeviceId,
    wipeDevice
  )

  app.get(
    pathPrefix('/admin/cache/refresh'),
    checkAgencyApiAccess(scopes => scopes.includes('admin:all')),
    refreshCache
  )

  app.post(
    pathPrefix('/stops'),
    checkAgencyApiAccess(scopes => scopes.includes('admin:all')),
    registerStop
  )

  app.get(pathPrefix('/stops/:stop_id'), readStop)

  app.get(pathPrefix('/stops'), readStops)

  return app
}

// ///////////////////// end test-only endpoints ///////////////////////

export { initialize, api }
