import nats from 'nats'
import logger from '@mds-core/mds-logger'

export type EventProcessor<TData, TResult> = (type: string, data: TData) => Promise<TResult>

const SUBSCRIPTION_TYPES = ['event', 'telemetry'] as const
type SUBSCRIPTION_TYPE = typeof SUBSCRIPTION_TYPES[number]

const subscriptionCb = async <TData, TResult>(processor: EventProcessor<TData, TResult>, msg: any) => {
  const { TENANT_ID } = process.env

  const TENANT_REGEXP = new RegExp(`^${TENANT_ID || 'mds'}\\.`)

  try {
    const {
      spec: {
        payload: { data, type }
      }
    } = JSON.parse(msg.getRawData().toString())

    const parsedData = JSON.parse(data)

    await processor(type.replace(TENANT_REGEXP, ''), parsedData)
    msg.ack()
  } catch (err) {
    msg.ack()
    logger.error(err)
  }
}

const natsSubscriber = async <TData, TResult>({
  nats,
  processor,
  TENANT_ID,
  type
}: {
  nats: nats.Client
  processor: EventProcessor<TData, TResult>
  TENANT_ID: string
  type: SUBSCRIPTION_TYPE
}) => {
  const subscriber = nats.subscribe(`${TENANT_ID || 'mds'}.${type}`, async (msg: any) => {
    return subscriptionCb(processor, msg)
  })
  return subscriber
}

const initializeNatsClient = () => {
  const { NATS = 'localhost' } = process.env
  return nats.connect(`nats://${NATS}:4222`, {
    reconnect: true,
    maxReconnectAttempts: -1 // Retry forever
  })
}

export const initializeNatsSubscriber = async <TData, TResult>({
  TENANT_ID,
  processor
}: {
  TENANT_ID: string
  processor: EventProcessor<TData, TResult>
}) => {
  const nats = initializeNatsClient()

  try {
    nats.on('connect', () => {
      logger.info('Connected!')

      /* Subscribe to all available types. Down the road, this should probably be a parameter passed in to the parent function. */
      return Promise.all(
        SUBSCRIPTION_TYPES.map(type => {
          return natsSubscriber({ nats, processor, TENANT_ID, type })
        })
      )
    })

    nats.on('reconnect', () => {
      logger.info('Connected!')

      /* Subscribe to all available types. Down the road, this should probably be a parameter passed in to the parent function. */
      return Promise.all(
        SUBSCRIPTION_TYPES.map(type => {
          return natsSubscriber({ nats, processor, TENANT_ID, type })
        })
      )
    })

    /* istanbul ignore next */
    nats.on('error', async err => {
      logger.error(err)
    })
  } catch (err) {
    logger.error(err)
  }
}
