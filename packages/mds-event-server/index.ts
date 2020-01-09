import express from 'express'
import stan from 'node-nats-streaming'
import { pathsFor } from '@mds-core/mds-utils'
import { AboutRequestHandler, HealthRequestHandler, JsonBodyParserMiddleware } from '@mds-core/mds-api-server'

export type EventProcessor<TData, TResult> = (type: string, data: TData) => Promise<TResult>

export const initializeStanSubscriber = <TData, TResult>({
  NATS,
  TENANT_ID,
  pid,
  processor
}: {
  NATS?: string
  TENANT_ID?: string
  pid?: number
  processor: EventProcessor<TData, TResult>
}) => {
  const nats = stan.connect('knative-nats-streaming', `mds-event-processor-${pid}`, {
    url: `nats://${NATS}:4222`
  })

  try {
    nats.on('connect', () => {
      const eventSubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.event`, {
        ...nats.subscriptionOptions(),
        manualAcks: true,
        maxInFlight: 1
      })

      eventSubscription.on('message', async (msg: any) => {
        const data = JSON.parse(msg.getData())
        await processor('event', data)
        msg.ack()
      })

      const telemetrySubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.telemetry`, {
        ...nats.subscriptionOptions(),
        manualAcks: true,
        maxInFlight: 1
      })

      telemetrySubscription.on('message', async (msg: any) => {
        const data = JSON.parse(msg.getData())
        await processor('telemetry', data)
        msg.ack()
      })
    })
  } catch (err) {
    console.log(err)
  }
}

export const EventServer = <TData, TResult>(
  processor?: EventProcessor<TData, TResult>,
  server: express.Express = express()
): express.Express => {
  // Disable x-powered-by header
  server.disable('x-powered-by')

  // Middleware
  server.use(JsonBodyParserMiddleware({ limit: '1mb' }))

  // Routes
  server.get(pathsFor('/'), AboutRequestHandler)

  server.get(pathsFor('/health'), HealthRequestHandler)

  return server
}
