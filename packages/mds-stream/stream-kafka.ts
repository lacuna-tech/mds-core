import { VehicleEvent, Telemetry, Device } from '@mds-core/mds-types'
import log from '@mds-core/mds-logger'
import Kafka, { ProducerStream } from 'node-rdkafka'
import { Stream } from './stream-interface'

const {
  env: { KAFKA_HOST = 'localhost:9092' }
} = process

/*
  FIXME:
  Necessary interface due to already-fixed typedef problem in the node-rdkafka repo,
  will be removed upon next upstream release
*/
interface Producer {
  createWriteStream(conf: any, topicConf: any, streamOptions: any): ProducerStream
}

/*
  FIXME:
  Strange casting here necessary due to problem described in the Producer interface above
*/
const eventStream = ((Kafka.Producer as unknown) as Producer).createWriteStream(
  {
    'metadata.broker.list': KAFKA_HOST,
    'queue.buffering.max.messages': 100000
  },
  {},
  {
    topic: 'mds.event'
  }
)

/*
  FIXME:
  Strange casting here necessary due to problem described in the Producer interface above
*/
const telemetryStream = ((Kafka.Producer as unknown) as Producer).createWriteStream(
  {
    'metadata.broker.list': KAFKA_HOST,
    'queue.buffering.max.messages': 100000
  },
  {},
  {
    topic: 'mds.telemetry'
  }
)

/*
  FIXME:
  Strange casting here necessary due to problem described in the Producer interface above
*/
const deviceStream = ((Kafka.Producer as unknown) as Producer).createWriteStream(
  {
    'metadata.broker.list': KAFKA_HOST,
    'queue.buffering.max.messages': 100000
  },
  {},
  {
    topic: 'mds.device'
  }
)

eventStream.on('error', async err => {
  await log.error(`Kafka Error ${JSON.stringify(err)}`)
})

telemetryStream.on('error', async err => {
  await log.error(`Kafka Error ${JSON.stringify(err)}`)
})

deviceStream.on('error', async err => {
  await log.error(`Kafka Error ${JSON.stringify(err)}`)
})

const writeTelemetry = (telemetry: Telemetry[]): Promise<void> => {
  const results = telemetry.map(telem => telemetryStream.write(JSON.stringify(telem)))
  const failures = results.filter(result => !result).length
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    if (failures !== 0) {
      reject(failures)
    }
    resolve()
  })
}

const writeEvent = (event: VehicleEvent): Promise<void> => {
  const result = eventStream.write(JSON.stringify(event))
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    if (!result) {
      reject(result)
    }
    resolve()
  })
}

const writeDevice = (event: Device): Promise<void> => {
  const result = eventStream.write(JSON.stringify(event))
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    if (!result) {
      reject(result)
    }
    resolve()
  })
}

const shutdown = () => {
  eventStream.destroy()
  telemetryStream.destroy()
  deviceStream.destroy()
}

export const KafkaStream: Stream & { shutdown: () => void } = { writeEvent, writeTelemetry, writeDevice, shutdown }
