import { EachMessagePayload, Consumer } from 'kafkajs'
import { StreamConsumer } from '../stream-interface'
import { disconnectConsumer, createStreamConsumer, StreamConsumerOptions } from './helpers'

export const KafkaStreamConsumer = (
  topic: string,
  eachMessage: (payload: EachMessagePayload) => Promise<void>,
  options?: Partial<StreamConsumerOptions>
): StreamConsumer => {
  let consumer: Consumer | undefined
  return {
    initialize: async () => {
      if (!consumer) {
        consumer = await createStreamConsumer(topic, eachMessage, options)
      }
    },
    shutdown: async () => disconnectConsumer(consumer)
  }
}
