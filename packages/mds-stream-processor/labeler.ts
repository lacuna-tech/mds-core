import { minutes, hours } from '@mds-core/mds-utils'
import { v4 as uuid } from 'uuid'

interface VehicleEvent {
  device_id: string
  event_type: string
  timestamp: number
  recorded: number
}

type MessageLabeler<TMessage, TLabel> = (message: TMessage) => Promise<TLabel>

const timestampBinLabeler: (size: number) => MessageLabeler<{ timestamp: number }, string> = size => {
  return async ({ timestamp }) => {
    const start = timestamp - (timestamp % size)
    return `${start}-${start + size - 1}`
  }
}

const timeStampFiveMinuteBinLabeler = timestampBinLabeler(minutes(5))
const timeStampFifteenMinuteBinLabeler = timestampBinLabeler(minutes(15))
const timeStampOneHourBinLabeler = timestampBinLabeler(hours(1))

const MessageLatencyLabeler: MessageLabeler<{ timestamp: number; recorded: number }, number> = async ({
  timestamp,
  recorded
}) => recorded - timestamp

const label = async (message: VehicleEvent) => {
  const labeled: VehicleEvent = { ...message }
  const [
    message_latency_ms,
    timestamp_bin_5_minutes,
    timestamp_bin_15_minutes,
    timestamp_bin_1_hour
  ] = await Promise.all([
    MessageLatencyLabeler(message),
    timeStampFiveMinuteBinLabeler(message),
    timeStampFifteenMinuteBinLabeler(message),
    timeStampOneHourBinLabeler(message)
  ])
  return Object.assign(labeled, {
    message_latency_ms,
    timestamp_bin_5_minutes,
    timestamp_bin_15_minutes,
    timestamp_bin_1_hour
  })
}

async function main() {
  const labeled = await label({
    event_type: 'register',
    device_id: uuid(),
    recorded: Date.now(),
    timestamp: Date.now() - 5000
  })

  console.log(labeled)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
