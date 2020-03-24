import stream from '@mds-core/mds-stream'
import logger from '@mds-core/mds-logger'
import { StreamConsumer } from '@mds-core/mds-stream/stream-interface'
import { Nullable } from '@mds-core/mds-orm/types'
import { StreamConsumerOptions } from '@mds-core/mds-stream/kafka/helpers'

export const StreamProcessor = <T>(
  topic: string,
  processor: (message: T) => Promise<void>,
  options?: Partial<StreamConsumerOptions>
) => {
  let consumer: Nullable<StreamConsumer> = null
  return {
    start: async () => {
      if (!consumer) {
        consumer = stream.KafkaStreamConsumer(
          topic,
          async ({ message: { value } }) => {
            const message: T = JSON.parse(value.toString())
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

interface VehicleEvent {
  device_id: string
  year: number
}

export const processor = StreamProcessor(
  'mds.event',
  async (event: VehicleEvent) => {
    logger.info('EVENT', event)
  },
  { groupId: 'event-labeler' }
)
