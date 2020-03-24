import { Kafka, Producer, EachMessagePayload, Consumer } from 'kafkajs'
import log from '@mds-core/mds-logger'

const {
  env: { KAFKA_HOST = 'localhost:9092' }
} = process

export interface StreamProducerOptions {
  clientId: string
}

export const createStreamProducer = async ({ clientId = 'writer' }: Partial<StreamProducerOptions> = {}) => {
  try {
    const kafka = new Kafka({ clientId, brokers: [KAFKA_HOST] })
    const producer = kafka.producer()
    await producer.connect()
    return producer
  } catch (err) {
    await log.error(err)
  }
}

export interface StreamConsumerOptions {
  clientId: string
  groupId: string
}

export const createStreamConsumer = async (
  topic: string,
  eachMessage: (payload: EachMessagePayload) => Promise<void>,
  { clientId = 'client', groupId = 'group' }: Partial<StreamConsumerOptions> = {}
) => {
  try {
    const kafka = new Kafka({ clientId, brokers: [KAFKA_HOST] })
    const consumer = kafka.consumer({ groupId })
    await consumer.connect()
    await consumer.subscribe({ topic })
    await consumer.run({ eachMessage })
    return consumer
  } catch (err) {
    await log.error(err)
  }
}

export const isProducerReady = (stream: Producer | undefined): stream is Producer => stream !== undefined

export const isConsumerReady = (stream: Consumer | undefined): stream is Consumer => stream !== undefined

export const disconnectProducer = async (producer: Producer | undefined) => {
  if (isProducerReady(producer)) {
    await producer.disconnect()
  }
}

export const disconnectConsumer = async (consumer: Consumer | undefined) => {
  if (isConsumerReady(consumer)) {
    await consumer.disconnect()
  }
}
