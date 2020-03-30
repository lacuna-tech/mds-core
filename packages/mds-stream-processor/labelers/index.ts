import db from '@mds-core/mds-db'
import { UUID, VEHICLE_TYPE, PROPULSION_TYPE, Nullable, Telemetry } from '@mds-core/mds-types'

type MessageLabeler<TMessage, TLabel> = (message: TMessage) => Promise<TLabel>

export interface DeviceLabel {
  vehicle_type: VEHICLE_TYPE
  vehicle_propulsion: PROPULSION_TYPE[]
}

export const deviceLabeler: MessageLabeler<{ device_id: UUID }, DeviceLabel> = async ({ device_id }) => {
  const { type: vehicle_type, propulsion: vehicle_propulsion } = await db.readDevice(device_id)
  return { vehicle_type, vehicle_propulsion }
}

export interface MessageLatencyLabel {
  message_latency_ms: number
}

export const messageLatencyLabeler: MessageLabeler<
  { timestamp: number; recorded: number },
  MessageLatencyLabel
> = async ({ timestamp, recorded }) => ({ message_latency_ms: recorded - timestamp })

export interface GeographiesLabel {
  geographies: UUID[]
}

export const geographiesLabeler: MessageLabeler<{ telemetry?: Nullable<Telemetry> }, GeographiesLabel> = async ({
  telemetry
}) => {
  return { geographies: [] }
}
