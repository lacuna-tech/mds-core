import { Producer } from 'kafkajs'
import { StreamWriter } from '../stream-interface'
import { createWriteStreamWrapper, isWriteStreamReady, killWriteStream } from './helpers'

export const KafkaStreamWriter = (topic: string): StreamWriter => {
  let producer: Producer | undefined
  return {
    initialize: async () => {
      if (!producer) producer = await createWriteStreamWrapper()
    },
    write: async (message: object) => {
      if (isWriteStreamReady(producer)) {
        return producer.send({
          topic,
          messages: [{ value: JSON.stringify(message) }]
        })
      }
    },
    shutdown: async () => {
      killWriteStream(producer)
    }
  }
}
