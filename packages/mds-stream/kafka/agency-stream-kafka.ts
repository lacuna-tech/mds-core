import { VehicleEvent, Telemetry, Device } from '@mds-core/mds-types'
import { AgencyStream, StreamWriter } from '../stream-interface'
import { KafkaStreamWriter } from './write-stream'

const producer: StreamWriter = KafkaStreamWriter()

const { initialize, shutdown } = producer

const writeTelemetry = async (telemetry: Telemetry[]) => producer.write('mds.telemetry', telemetry)

const writeEvent = async (event: VehicleEvent) => producer.write('mds.event', event)

const writeDevice = async (device: Device) => producer.write('mds.device', device)

export const AgencyKafkaStream: AgencyStream = { initialize, writeEvent, writeTelemetry, writeDevice, shutdown }
