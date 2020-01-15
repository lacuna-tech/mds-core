import express from 'express'
import uuid from 'uuid'
import stan from 'node-nats-streaming'
import { pathsFor } from '@mds-core/mds-utils'
import log from '@mds-core/mds-logger'
import { AboutRequestHandler, HealthRequestHandler, JsonBodyParserMiddleware } from '@mds-core/mds-api-server'
import Cloudevent, { BinaryHTTPReceiver } from 'cloudevents-sdk/v1'
import { StringDecoder } from 'string_decoder'

export type EventProcessor<TData, TResult> = (type: string, data: TData) => Promise<TResult>
export type CEEventProcessor<TData, TResult> = (type: string, data: TData, event: Cloudevent) => Promise<TResult>

export const initializeStanSubscriber = <TData, TResult>({
  STAN,
  STAN_CLUSTER,
  STAN_CREDS,
  TENANT_ID,
  processor
}: {
  STAN: string
  STAN_CLUSTER: string
  STAN_CREDS?: string
  TENANT_ID: string
  processor: EventProcessor<TData, TResult>
}) => {
  if (STAN && STAN_CLUSTER && TENANT_ID) {
    const decoder = new StringDecoder('utf8')
    const nats = stan.connect(STAN_CLUSTER, `mds-event-processor-${uuid()}`, {
      url: `nats://${STAN}:4222`,
      userCreds: STAN_CREDS
    })

    try {
      nats.on('connect', () => {
        log.info('Connected!')
        const eventSubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.event`, {
          ...nats.subscriptionOptions(),
          manualAcks: true,
          maxInFlight: 1
        })

        eventSubscription.on('message', async (msg: any) => {
          const {
            spec: {
              payload: { data }
            }
          } = JSON.parse(msg.getRawData().toString())
          const parsedData = JSON.parse(data)
          await processor('event', parsedData)
          msg.ack()
        })

        const telemetrySubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.telemetry`, {
          ...nats.subscriptionOptions(),
          manualAcks: true,
          maxInFlight: 1
        })

        telemetrySubscription.on('message', async (msg: any) => {
          const {
            spec: {
              payload: { data }
            }
          } = JSON.parse(decoder.write(msg.msg.array[3]))
          const parsedData = JSON.parse(data)
          await processor('telemetry', parsedData)
          msg.ack()
        })
      })
    } catch (err) {
      console.log(err)
    }
  } else console.log(`Cannot initialize STAN Subscribers. One of STAN, STAN_CLUSTER, or TENANT_ID is undefined.`)
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
        log.info('Cloud Event', method, event.format())
        const result = await processor(event.getType(), event.getData(), event)
        return res.status(200).send({ result })
      } catch (error) /* istanbul ignore next */ {
        await log.error('Cloud Event', error, { method, headers, body })
        return res.status(500).send({ error })
      }
    })
  }
  return server
}
