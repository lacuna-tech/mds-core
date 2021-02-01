/**
 * Copyright 2021 City of Los Angeles
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

import logger from '@mds-core/mds-logger'
import { ServiceProvider, ProcessController, ServiceResult, ServiceException } from '@mds-core/mds-service-helpers'
import { NotFoundError } from '@mds-core/mds-utils'
import { SchemaObject } from 'ajv'
import { CollectorService } from '../@types'
import { CollectorRepository } from '../repository'

const importSchema = async (name: string): Promise<SchemaObject> => {
  try {
    const { default: schema } = await import(`../schemas/${name}.schema`)
    return { $schema: 'http://json-schema.org/draft/2019-09/schema#', ...schema }
  } catch (error) {
    throw typeof error === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND'
      ? new NotFoundError(`Schema "${name}" not found`)
      : error
  }
}

export const CollectorServiceProvider: ServiceProvider<CollectorService> & ProcessController = {
  start: CollectorRepository.initialize,
  stop: CollectorRepository.shutdown,
  getMessageSchema: async name => {
    try {
      const schema = await importSchema(name)
      return ServiceResult(schema)
    } catch (error) {
      const exception = ServiceException('Error Reading Schema', error)
      logger.error(exception, error)
      return exception
    }
  },
  writeMessages: async (schema, messages) => {
    try {
      const inserted = await CollectorRepository.writeMessages(messages.map(message => ({ schema, message })))
      return ServiceResult(inserted)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException('Error Writing Messages', error)
      logger.error(exception, error)
      return exception
    }
  }
}
