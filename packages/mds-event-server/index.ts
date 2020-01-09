import express from 'express'
import logger from '@mds-core/mds-logger'
import stan from 'node-nats-streaming'
import { pathsFor } from '@mds-core/mds-utils'
import { AboutRequestHandler, HealthRequestHandler, JsonBodyParserMiddleware } from '@mds-core/mds-api-server'

export const EventServer = <TData, TResult>(server: express.Express = express()): express.Express => {
  const {
    env: { TENANT_ID = 'mds', NATS },
    pid
  } = process

  startStanClient(NATS, pid)
  // Disable x-powered-by header
  server.disable('x-powered-by')

  // Middleware
  server.use(JsonBodyParserMiddleware({ limit: '1mb' }))

  // Routes
  server.get(pathsFor('/'), AboutRequestHandler)

  server.get(pathsFor('/health'), HealthRequestHandler)

  return server
}

const startStanClient = ({ NATS, TENANT_ID, pid, processor }: { NATS: string; TENANT_ID: string; pid: string }) => {
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
