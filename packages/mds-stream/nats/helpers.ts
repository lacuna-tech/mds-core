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

import logger from '@mds-core/mds-logger'
import { SingleOrArray } from '@mds-core/mds-types'
import { asArray, getEnvVar } from '@mds-core/mds-utils'
import { connect, NatsConnection, SubscriptionOptions } from 'nats'
import { natsCbWrapper, NatsProcessorFn } from './codecs'

const initializeNatsClient = () => {
  const { NATS } = getEnvVar({ NATS: 'localhost' })
  return connect({
    servers: `nats://${NATS}:4222`,
    reconnect: true,
    waitOnFirstConnect: true,
    maxReconnectAttempts: -1 // Retry forever
  })
}

export const createStreamConsumer = async (
  topics: SingleOrArray<string>,
  processor: NatsProcessorFn,
  options: SubscriptionOptions = {}
) => {
  const natsClient = await initializeNatsClient()
  try {
    await Promise.all(
      asArray(topics).map(topic =>
        natsClient.subscribe(topic, {
          ...options,
          callback: natsCbWrapper(processor)
        })
      )
    )
  } catch (err) {
    logger.error(err)
  }
  return natsClient
}

export const createStreamProducer = async () => {
  return initializeNatsClient()
}

export const disconnectClient = (consumer: NatsConnection) => consumer.close()
