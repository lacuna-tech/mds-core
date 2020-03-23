import { ProducerStream } from 'node-rdkafka'
import { StreamWriter } from '../stream-interface'
import { createWriteStreamWrapper, isWriteStreamReady, killWriteStream } from './helpers'

export const KafkaStreamWriter: (name: string) => StreamWriter = name => {
  let stream: ProducerStream | undefined
  return {
    initialize: async () => {
      stream = await createWriteStreamWrapper({}, { topic: name })
    },
    write: async (message: object) => {
      if (isWriteStreamReady(stream)) {
        const result = stream.write(JSON.stringify(message))
        if (!result) return Promise.reject(result)
        return Promise.resolve()
      }
    },
    shutdown: async () => {
      killWriteStream(stream)
    }
  }
}
