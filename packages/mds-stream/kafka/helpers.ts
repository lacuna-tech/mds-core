import { Kafka, Producer, EachMessagePayload, Consumer } from 'kafkajs'
import log from '@mds-core/mds-logger'

const {
  env: { KAFKA_HOST = 'localhost:9092' }
} = process

export const defaultKafkaErrorHandler = async (err: object) => {
  await log.error(`Kafka Error ${JSON.stringify(err)}`)
}

export const createWriteStreamWrapper = async () => {
  const kafka = new Kafka({
    clientId: 'writer',
    brokers: [KAFKA_HOST]
  })

  const producer = kafka.producer()

  try {
    await producer.connect()
  } catch (err) {
    console.log(err)
  }

  return producer
}

export const createReadStreamWrapper = async (
  topic: string,
  readCb: (message: EachMessagePayload) => Promise<void>
  // errorHandler?: (err: any) => Promise<void>
) => {
  const kafka = new Kafka({
    clientId: 'reader',
    brokers: [KAFKA_HOST]
  })

  const consumer = kafka.consumer({ groupId: 'test-group' })

  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: true })

  await consumer.run({
    eachMessage: async msg => {
      const { partition, message } = msg
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString()
      })

      await readCb(msg)
    }
  })

  return consumer
}

export const isWriteStreamReady = (stream: Producer | undefined): stream is Producer => {
  return stream !== undefined
}

export const isReadStreamReady = (stream: Consumer | undefined): stream is Consumer => {
  return stream !== undefined
}

export const killWriteStream = (stream: Producer | undefined) => {
  if (isWriteStreamReady(stream)) {
    stream.disconnect()
  }
}

export const killReadStream = (stream: Consumer | undefined) => {
  if (isReadStreamReady(stream)) {
    stream.disconnect()
  }
}
