import Kafka, { ProducerStream } from 'node-rdkafka'
import log from '@mds-core/mds-logger'
import { ProducerOptions, StreamOptions, Producer } from './types'

const {
  env: { KAFKA_HOST = 'localhost:9092' }
} = process

export const defaultKafkaErrorHandler = async (err: any) => {
  await log.error(`Kafka Error ${JSON.stringify(err)}`)
}

export const createWriteStreamWrapper = (
  producerOptions: Partial<ProducerOptions>,
  streamOptions: Partial<StreamOptions>,
  errorHandler?: (err: any) => Promise<void>
) => {
  const stream = ((Kafka.Producer as unknown) as Producer).createWriteStream(
    { ...producerOptions, 'metadata.broker.list': KAFKA_HOST, 'queue.buffering.max.messages': 100000 },
    {},
    { ...streamOptions }
  )

  stream.on('error', errorHandler ?? defaultKafkaErrorHandler)
  return stream
}

export const isStreamReady = (stream: ProducerStream | undefined): stream is ProducerStream => {
  return stream !== undefined
}

export const killStream = (stream: ProducerStream | undefined) => {
  if (isStreamReady(stream)) {
    stream.destroy()
  }
}
