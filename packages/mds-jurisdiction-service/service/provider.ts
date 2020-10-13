/*
    Copyright 2019-2020 City of Los Angeles.

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
import {
  ServiceProvider,
  ProcessController,
  ServiceResult,
  ServiceResponse,
  ServiceException
} from '@mds-core/mds-service-helpers'
import { Nullable } from '@mds-core/mds-types'
import { JurisdictionRepository } from '../repository'
import {
  CreateJurisdictionDomainModel,
  GetJurisdictionsOptions,
  JurisdictionDomainModel,
  JurisdictionIdType,
  JurisdictionService,
  UpdateJurisdictionDomainModel
} from '../@types'
import { ValidateJurisdictionForCreate } from './validators'

export const JurisdictionServiceProvider: ServiceProvider<JurisdictionService> & ProcessController = {
  start: JurisdictionRepository.initialize,
  stop: JurisdictionRepository.shutdown,

  createJurisdiction: async (
    model: CreateJurisdictionDomainModel
  ): Promise<ServiceResponse<JurisdictionDomainModel>> => {
    try {
      const [jurisdiction] = await JurisdictionRepository.createJurisdictions(
        [model].map(ValidateJurisdictionForCreate)
      )
      return ServiceResult(jurisdiction)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Jurisdiction', error)
      logger.error(exception, error)
      return exception
    }
  },

  createJurisdictions: async (
    models: CreateJurisdictionDomainModel[]
  ): Promise<ServiceResponse<JurisdictionDomainModel[]>> => {
    try {
      const jurisdictions = await JurisdictionRepository.createJurisdictions(models.map(ValidateJurisdictionForCreate))
      return ServiceResult(jurisdictions)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Creating Jurisdictions', error)
      logger.error(exception, error)
      return exception
    }
  },

  deleteJurisdiction: async (
    jurisdiction_id: JurisdictionIdType
  ): Promise<ServiceResponse<Pick<JurisdictionDomainModel, 'jurisdiction_id'>>> => {
    try {
      const deleted = await JurisdictionRepository.deleteJurisdiction(jurisdiction_id)
      return ServiceResult(deleted)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Deleting Jurisdiction', error)
      logger.error(exception, error)
      return exception
    }
  },

  getJurisdiction: async (
    jurisdiction_id: JurisdictionIdType,
    options?: Nullable<GetJurisdictionsOptions>
  ): Promise<ServiceResponse<JurisdictionDomainModel>> => {
    try {
      const jurisdiction = await JurisdictionRepository.readJurisdiction(jurisdiction_id, options ?? {})
      return ServiceResult(jurisdiction)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Reading Jurisdiction', error)
      logger.error(exception, error)
      return exception
    }
  },

  getJurisdictions: async (
    options?: Nullable<GetJurisdictionsOptions>
  ): Promise<ServiceResponse<JurisdictionDomainModel[]>> => {
    try {
      const jurisdicitons = await JurisdictionRepository.readJurisdictions(options ?? {})
      return ServiceResult(jurisdicitons)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Reading Jurisdictions', error)
      logger.error(exception, error)
      return exception
    }
  },

  updateJurisdiction: async (
    jurisdiction_id: JurisdictionIdType,
    jurisdiction: UpdateJurisdictionDomainModel
  ): Promise<ServiceResponse<JurisdictionDomainModel>> => {
    try {
      const updated = await JurisdictionRepository.updateJurisdiction(jurisdiction_id, jurisdiction)
      return ServiceResult(updated)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Updating Jurisdiction', error)
      logger.error(exception, error)
      return exception
    }
  }
}
