import stream from '@mds-core/mds-stream'
import { StreamConsumer } from '@mds-core/mds-stream/stream-interface'
import { StreamConsumerOptions } from '@mds-core/mds-stream/kafka/helpers'
import { Nullable } from '@mds-core/mds-types'

export const StreamProcessor = <TMessage>(
  topic: string,
  processor: (message: TMessage) => Promise<void>,
  options?: Partial<StreamConsumerOptions>
) => {
  let consumer: Nullable<StreamConsumer> = null
  return {
    start: async () => {
      if (!consumer) {
        consumer = stream.KafkaStreamConsumer(
          topic,
          async ({ message: { value } }) => {
            const message: TMessage = JSON.parse(value.toString())
            await processor(message)
          },
          options
        )
      }
      return consumer.initialize()
    },
    stop: async () => {
      if (consumer) {
        await consumer.shutdown()
        consumer = null
      }
    }
  }
}
