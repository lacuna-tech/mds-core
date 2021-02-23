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
import stream, { StreamProducer } from '@mds-core/mds-stream'
import {
  ServiceProvider,
  ProcessController,
  ServiceResult,
  ServiceException,
  ServiceError
} from '@mds-core/mds-service-helpers'
import { getEnvVar, NotFoundError, pluralize, ServerError } from '@mds-core/mds-utils'
import { SchemaObject, ValidateFunction, ErrorObject } from 'ajv'
import { CollectorService } from '../@types'
import { CollectorRepository } from '../repository'
import { SchemaValidator } from '../schema-validator'

const SchemaObjects = new Map<string, SchemaObject>()
type CollectorValidateFunction = ValidateFunction<{}>
const ValidateFunctions = new Map<string, CollectorValidateFunction>()
type CollectorStreamProducer = StreamProducer<{}>
const StreamProducers = new Map<string, CollectorStreamProducer>()

const { TENANT_ID } = getEnvVar({
  TENANT_ID: 'mds'
})

const importSchemaObject = async (schema_id: string): Promise<SchemaObject> => {
  const module = `../schemas/${schema_id}.schema`
  try {
    const { default: schema } = await import(module)
    return { $schema: 'http://json-schema.org/draft-07/schema#', ...schema }
  } catch (error) {
    throw typeof error === 'object' && error !== null && error.code === 'MODULE_NOT_FOUND'
      ? new NotFoundError(`Schema module ${module} not found`)
      : error
  }
}

const getSchemaObject = async (schema_id: string): Promise<SchemaObject> => {
  const $schema = (schema: SchemaObject) => ({
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...schema
  })

  const schema = SchemaObjects.get(schema_id) ?? $schema(await importSchemaObject(schema_id))
  if (!SchemaObjects.has(schema_id)) {
    SchemaObjects.set(schema_id, schema)
  }
  return schema
}

const getValidateFunction = async (schema_id: string): Promise<CollectorValidateFunction> => {
  const validator = ValidateFunctions.get(schema_id) ?? SchemaValidator(await getSchemaObject(schema_id))
  if (!ValidateFunctions.has(schema_id)) {
    ValidateFunctions.set(schema_id, validator)
  }
  return validator
}

const MockStreamProducer: CollectorStreamProducer = {
  initialize: async () => undefined,
  shutdown: async () => undefined,
  write: async message => undefined
}

const createStreamProducer = async (schema_id: string): Promise<CollectorStreamProducer> => {
  const topic = `${TENANT_ID}.collector.${schema_id}`
  // TODO: Do we need to create the topic?
  const producer = process.env.KAFKA_HOST !== undefined ? stream.KafkaStreamProducer(topic) : MockStreamProducer
  await producer.initialize()
  return producer
}

const getStreamProducer = async (schema_id: string): Promise<CollectorStreamProducer> => {
  const producer = StreamProducers.get(schema_id) ?? (await createStreamProducer(schema_id))
  if (!StreamProducers.has(schema_id)) {
    StreamProducers.set(schema_id, producer)
  }
  return producer
}

export const CollectorServiceProvider: ServiceProvider<CollectorService> & ProcessController = {
  start: CollectorRepository.initialize,
  stop: CollectorRepository.shutdown,
  getMessageSchema: async schema_id => {
    try {
      const schema = await getSchemaObject(schema_id)
      return ServiceResult(schema)
    } catch (error) {
      const exception = ServiceException(`Error Reading Schema ${schema_id}`, error)
      logger.error(exception, error)
      return exception
    }
  },
  writeSchemaMessages: async (schema_id, provider_id, messages) => {
    try {
      const [validate, producer] = await Promise.all([getValidateFunction(schema_id), getStreamProducer(schema_id)])

      const invalid = messages.reduce<{ position: number; errors: Partial<ErrorObject>[] }[]>(
        (errors, message, position) => {
          // eslint-reason validate function has previously verified that errors is non-null
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return validate(message) ? errors : errors.concat({ position, errors: validate.errors! })
        },
        []
      )

      if (invalid.length > 0) {
        return ServiceError({
          type: 'ValidationError',
          message: `Invalid ${pluralize(invalid.length, 'message', 'messages')} for schema ${schema_id}`,
          details: { invalid }
        })
      }

      // Write to Postgres
      const result = await CollectorRepository.insertCollectorMessages(
        messages.map(message => ({ schema_id, provider_id, message })),
        // Write to Kafka prior to committing transaction
        {
          beforeCommit: async () => {
            try {
              await producer.write(messages)
            } catch (error) {
              throw new ServerError('Error writing to Kafka stream', error)
            }
          }
        }
      )

      return ServiceResult(result)
    } catch (error) /* istanbul ignore next */ {
      const exception = ServiceException(`Error Writing Messages for Schema ${schema_id}`, error)
      logger.error(exception, error)
      return exception
    }
  }
}
