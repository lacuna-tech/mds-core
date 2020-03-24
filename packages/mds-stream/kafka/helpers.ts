import { Kafka, Producer, EachMessagePayload, Consumer } from 'kafkajs'
import log from '@mds-core/mds-logger'
import { v4 as uuid } from 'uuid'

const {
  env: { KAFKA_HOST = 'localhost:9092' }
} = process

export const createWriteStreamWrapper = async () => {
  try {
    const kafka = new Kafka({
      clientId: `writer-${uuid()}`,
      brokers: [KAFKA_HOST]
    })

    const producer = kafka.producer()

    await producer.connect()
    return producer
  } catch (err) {
    await log.error(err)
  }
}

export const createReadStreamWrapper = async (
  topic: string,
  readCb: (message: EachMessagePayload) => Promise<void>
) => {
  try {
    const kafka = new Kafka({
      clientId: `reader-${uuid()}`,
      brokers: [KAFKA_HOST]
    })

    const consumer = kafka.consumer({ groupId: 'test-group' })

    await consumer.connect()
    await consumer.subscribe({ topic, fromBeginning: true })

    await consumer.run({
      eachMessage: async msg => {
        await readCb(msg)
      }
    })

    return consumer
  } catch (err) {
    await log.error(err)
  }
}

export const isProducerReady = (stream: Producer | undefined): stream is Producer => {
  return stream !== undefined
}

export const isConsumerReady = (stream: Consumer | undefined): stream is Consumer => {
  return stream !== undefined
}

export const killProducer = async (stream: Producer | undefined) => {
  if (isProducerReady(stream)) {
    await stream.disconnect()
  }
}

export const killConsumer = async (stream: Consumer | undefined) => {
  if (isConsumerReady(stream)) {
    await stream.disconnect()
  }
}
