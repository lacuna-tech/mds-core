/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { Telemetry, Timestamp, Nullable, UUID, TelemetryData } from '@mds-core/mds-types'
import logger from '@mds-core/mds-logger'
import { DeviceLabel, DeviceLabeler, GeographyLabel, GeographyLabeler, LatencyLabel, LatencyLabeler } from '../labelers'
import { StreamTransform, StreamProcessor } from './index'
import { KafkaSource, KafkaSink } from '../connectors/kafka-connector'
import { flattenTelemetry } from '../flatteners/telemetry-flattener'

const {
  env: { TENANT_ID = 'mds' }
} = process

interface LabeledVehicleTelemetry extends LatencyLabel, DeviceLabel, GeographyLabel {
  device_id: UUID
  provider_id: UUID
  telemetry_recorded: Timestamp
  telemetry_timestamp: Timestamp
  telemetry_lat: number
  telemetry_lng: number
  telemetry_altitude: Nullable<number>
  telemetry_heading: Nullable<number>
  telemetry_speed: Nullable<number>
  telemetry_accuracy: Nullable<number>
  telemetry_charge: Nullable<number>
}

const [deviceLabeler, geographyLabeler, latencyLabeler] = [DeviceLabeler(), GeographyLabeler(), LatencyLabeler()]

const processVehicleTelemetry: StreamTransform<
  Telemetry & { recorded: Timestamp },
  LabeledVehicleTelemetry
> = async telemetry => {
  const { device_id, provider_id, timestamp, recorded } = telemetry
  try {
    const [deviceLabel, latencyLabel, geographyLabel, flattenedTelemetry] = await Promise.all([
      deviceLabeler({ device_id }),
      geographyLabeler({ telemetry }),
      latencyLabeler({ timestamp, recorded }),
      flattenTelemetry(telemetry)
    ])
    const transformed: LabeledVehicleTelemetry = {
      device_id,
      provider_id,
      ...flattenedTelemetry,
      ...deviceLabel,
      ...geographyLabel,
      ...latencyLabel
    }
    return transformed
  } catch (error) {
    logger.error('Error processing telemetry', telemetry)
  }
  return null
}

export const VehicleTelemetryProcessor = StreamProcessor(
  KafkaSource<Telemetry & { gps: TelemetryData } & { recorded: Timestamp }>(`${TENANT_ID}.telemetry`, {
    groupId: 'mds-telemetry-processor'
  }),
  processVehicleTelemetry,
  KafkaSink<LabeledVehicleTelemetry>(`${TENANT_ID}.telemetry.annotated`, { clientId: 'mds-telemetry-processor' })
)
