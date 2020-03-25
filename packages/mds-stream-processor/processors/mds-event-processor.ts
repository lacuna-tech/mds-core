import { VehicleEvent, EVENT_STATUS_MAP, Nullable } from '@mds-core/mds-types'
import stream from '@mds-core/mds-stream'
import { StreamProducer } from '@mds-core/mds-stream/stream-interface'
import { StreamProcessor } from '../index'
import { deviceLabeler, messageLatencyLabeler } from '../labelers'

let producer: Nullable<StreamProducer> = null

export const processor = StreamProcessor(
  'mds.event',
  async ({
    device_id,
    provider_id,
    event_type,
    event_type_reason,
    timestamp,
    recorded,
    trip_id,
    telemetry,
    service_area_id
  }: VehicleEvent) => {
    if (!producer) {
      producer = await stream.KafkaStreamProducer('mds.event.annotated', { clientId: 'mds-event-processor' })
      await producer.initialize()
    }
    const labels = await Promise.all([deviceLabeler({ device_id }), messageLatencyLabeler({ timestamp, recorded })])
    const [{ type: vehicle_type, propulsion: vehicle_propulsion }, message_latency_ms] = labels
    await producer.write({
      device_id,
      provider_id,
      event_type,
      event_type_reason,
      event_timestamp: timestamp,
      event_recorded: recorded,
      trip_id,
      telemetry_timestamp: telemetry?.timestamp ?? null,
      telemetry_lat: telemetry?.gps.lat ?? null,
      telemetry_lng: telemetry?.gps.lng ?? null,
      telemetry_altitude: telemetry?.gps.altitude ?? null,
      telemetry_heading: telemetry?.gps.heading ?? null,
      telemetry_speed: telemetry?.gps.speed ?? null,
      telemetry_accuracy: telemetry?.gps.accuracy ?? null,
      telemetry_charge: telemetry?.charge ?? null,
      message_latency_ms,
      vehicle_type,
      vehicle_propulsion,
      vehicle_state: EVENT_STATUS_MAP[event_type],
      geographies: service_area_id ? [service_area_id] : []
    })
  },
  { groupId: 'mds-event-processor' }
)
