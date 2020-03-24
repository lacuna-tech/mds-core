import { VehicleEvent, Telemetry, Device } from '@mds-core/mds-types'
import { AgencyStream, StreamProducer } from '../stream-interface'
import { KafkaStreamProducer } from './stream-producer'

const producer: StreamProducer = KafkaStreamProducer()

const { initialize, shutdown } = producer

const writeTelemetry = async (telemetry: Telemetry[]) => producer.write('mds.telemetry', telemetry)

const writeEvent = async (event: VehicleEvent) => producer.write('mds.event', event)

const writeDevice = async (device: Device) => producer.write('mds.device', device)

export const AgencyKafkaStream: AgencyStream = { initialize, writeEvent, writeTelemetry, writeDevice, shutdown }
