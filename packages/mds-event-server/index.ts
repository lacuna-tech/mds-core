import express from 'express'
import stan from 'node-nats-streaming'
import { pathsFor } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import { AboutRequestHandler, HealthRequestHandler, JsonBodyParserMiddleware } from '@mds-core/mds-api-server'
import Cloudevent, { BinaryHTTPReceiver } from 'cloudevents-sdk/v1'

export type EventProcessor<TData, TResult> = (type: string, data: TData) => Promise<TResult>
export type CEEventProcessor<TData, TResult> = (type: string, data: TData, event: Cloudevent) => Promise<TResult>

export const initializeStanSubscriber = <TData, TResult>({
  STAN,
  STAN_CLUSTER_ID,
  TENANT_ID,
  pid,
  processor
}: {
  STAN: string
  STAN_CLUSTER_ID: string
  TENANT_ID: string
  pid: number
  processor: EventProcessor<TData, TResult>
}) => {
  const nats = stan.connect(STAN_CLUSTER_ID, `mds-event-processor-${pid}`, {
    url: `nats://${STAN}:4222`
  })

  try {
    nats.on('connect', () => {
      const eventSubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.event`, {
        ...nats.subscriptionOptions(),
        manualAcks: true,
        maxInFlight: 1
      })

      eventSubscription.on('message', async (msg: any) => {
        const { data } = JSON.parse(msg.getData())
        await processor('event', data)
        msg.ack()
      })

      const telemetrySubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.telemetry`, {
        ...nats.subscriptionOptions(),
        manualAcks: true,
        maxInFlight: 1
      })

      telemetrySubscription.on('message', async (msg: any) => {
        const { data } = JSON.parse(msg.getData())
        await processor('telemetry', data)
        msg.ack()
      })
    })
  } catch (err) {
    console.log(err)
  }
}

export const EventServer = <TData, TResult>(
  processor?: CEEventProcessor<TData, TResult>,
  server: express.Express = express()
): express.Express => {
  const receiver = new BinaryHTTPReceiver()
  const { TENANT_ID = 'mds' } = process.env
  const TENANT_REGEXP = new RegExp(`^${TENANT_ID}\\.`)

  const parseCloudEvent = (req: express.Request): Cloudevent => {
    const event = receiver.parse(req.body, req.headers)
    return event.type(event.getType().replace(TENANT_REGEXP, ''))
  }

  // Disable x-powered-by header
  server.disable('x-powered-by')

  // Middleware
  server.use(JsonBodyParserMiddleware({ limit: '1mb' }))

  // Routes
  server.get(pathsFor('/'), AboutRequestHandler)

  server.get(pathsFor('/health'), HealthRequestHandler)

  if (processor) {
    server.post('/', async (req, res) => {
      const { method, headers, body } = req
      try {
        const event = parseCloudEvent(req)
        await logger.info('Cloud Event', method, event.format())
        const result = await processor(event.getType(), event.getData(), event)
        return res.status(200).send({ result })
      } catch (error) /* istanbul ignore next */ {
        await logger.error('Cloud Event', error, { method, headers, body })
        return res.status(500).send({ error })
      }
    })
  }
  return server
}
