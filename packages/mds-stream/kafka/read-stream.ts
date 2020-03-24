import { EachMessagePayload, Consumer } from 'kafkajs'
import { StreamReader } from '../stream-interface'
import { killReadStream, createReadStreamWrapper } from './helpers'

export const KafkaStreamReader: (name: string, readCb: (data: EachMessagePayload) => Promise<void>) => StreamReader = (
  name,
  readCb
) => {
  let stream: Consumer | undefined
  return {
    initialize: async () => {
      if (!stream) stream = await createReadStreamWrapper(name, readCb)
    },
    shutdown: async () => {
      killReadStream(stream)
    }
  }
}
