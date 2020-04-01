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
import stream from '@mds-core/mds-stream'
import { StreamConsumerOptions, StreamProducerOptions } from '@mds-core/mds-stream/kafka/helpers'
import { StreamProducer, StreamConsumer } from 'packages/mds-stream/stream-interface'

export type StreamSource<TMessage> = (processor: (message: TMessage) => Promise<void>) => StreamConsumer
export type StreamTransform<TMessageIn, TMessageOut> = (message: TMessageIn) => Promise<TMessageOut | null>
export type StreamSink<TMessage> = () => StreamProducer<TMessage>

export interface StreamProcessorController {
  start: () => Promise<void>
  stop: () => Promise<void>
}

export const StreamProcessor = <TMessageIn, TMessageOut>(
  source: StreamSource<TMessageIn>,
  transform: StreamTransform<TMessageIn, TMessageOut>,
  sink: StreamSink<TMessageOut>
): StreamProcessorController => {
  const producer = sink()
  const consumer = source(async message => {
    const transformed = await transform(message)
    if (transformed) {
      await producer.write(transformed)
    }
  })
  return {
    start: async () => {
      await producer.initialize()
      await consumer.initialize()
    },
    stop: async () => {
      await Promise.all([consumer.shutdown(), producer.shutdown()])
    }
  }
}

export const KafkaStreamSource = <TMessage>(
  topic: string,
  options?: Partial<StreamConsumerOptions>
): StreamSource<TMessage> => processor =>
  stream.KafkaStreamConsumer(
    topic,
    payload => {
      const {
        partition,
        message: { offset, value }
      } = payload
      if (Number(offset) % 1_000 === 0) {
        logger.info(`KafkaStreamSource Topic: ${topic} Partition: ${partition} Offset: ${offset}`)
      }
      return processor(JSON.parse(value.toString()))
    },
    options
  )

export const KafkaStreamSink = <TMessage>(
  topic: string,
  options?: Partial<StreamProducerOptions>
): StreamSink<TMessage> => () => stream.KafkaStreamProducer(topic, options)
