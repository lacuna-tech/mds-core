import db from '@mds-core/mds-db'
import { Device, UUID } from '@mds-core/mds-types'

type MessageLabeler<TMessage, TLabel> = (message: TMessage) => Promise<TLabel>

export const deviceLabeler: MessageLabeler<{ device_id: UUID }, Pick<Device, 'type' | 'propulsion'>> = async ({
  device_id
}) => {
  const { type, propulsion } = await db.readDevice(device_id)
  return { type, propulsion }
}

export const messageLatencyLabeler: MessageLabeler<{ timestamp: number; recorded: number }, number> = async ({
  timestamp,
  recorded
}) => recorded - timestamp
