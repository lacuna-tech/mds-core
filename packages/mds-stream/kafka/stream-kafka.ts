import { VehicleEvent, Telemetry, Device } from '@mds-core/mds-types'
import { ProducerStream } from 'node-rdkafka'
import { Stream } from '../stream-interface'
import { createWriteStreamWrapper, isStreamReady, killStream } from './helpers'

let eventStream: ProducerStream | undefined
let telemetryStream: ProducerStream | undefined
let deviceStream: ProducerStream | undefined

const initialize = () => {
  eventStream = createWriteStreamWrapper({}, { topic: 'mds.event' })

  telemetryStream = createWriteStreamWrapper({}, { topic: 'mds.telemetry' })

  deviceStream = createWriteStreamWrapper({}, { topic: 'mds.device' })
}

const writeTelemetry = async (telemetry: Telemetry[]) => {
  if (isStreamReady(telemetryStream)) {
    /*
      We need to do this strange assignment due to a bug with typeguards
      and maps where the typing is lost
    */
    const stream = telemetryStream

    const results = telemetry.map(telem => stream.write(JSON.stringify(telem)))
    const failures = results.filter(result => !result).length
    if (failures !== 0) return Promise.reject(failures)
    return Promise.resolve()
  }
}

const writeEvent = async (event: VehicleEvent) => {
  if (isStreamReady(eventStream)) {
    const result = eventStream.write(JSON.stringify(event))
    if (!result) return Promise.reject(result)
    return Promise.resolve()
  }
}

const writeDevice = async (event: Device): Promise<void> => {
  if (isStreamReady(deviceStream)) {
    const result = deviceStream.write(JSON.stringify(event))
    if (!result) return Promise.reject(result)
    return Promise.resolve()
  }
}

const shutdown = () => {
  killStream(eventStream)
  killStream(telemetryStream)
  killStream(deviceStream)
}

export const KafkaStream: Stream = { initialize, writeEvent, writeTelemetry, writeDevice, shutdown }
