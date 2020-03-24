import { Producer } from 'kafkajs'
import { isArray } from 'util'
import { StreamWriter } from '../stream-interface'
import { createWriteStreamWrapper, isProducerReady, killProducer } from './helpers'

export const KafkaStreamWriter = (): StreamWriter => {
  let producer: Producer | undefined
  return {
    initialize: async () => {
      if (!producer) producer = await createWriteStreamWrapper()
    },
    write: async <T extends {}>(topic: string, message: T[] | T) => {
      if (isProducerReady(producer)) {
        const messages = (isArray(message) ? message : [message]).map(msg => {
          return { value: JSON.stringify(msg) }
        })

        await producer.send({
          topic,
          messages
        })
      }
    },
    shutdown: async () => killProducer(producer)
  }
}
