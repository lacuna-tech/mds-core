import express from 'express'
import logger from '@mds-core/mds-logger'
import { pathsFor, ServerError } from '@mds-core/mds-utils'
import { AboutRequestHandler, HealthRequestHandler, JsonBodyParserMiddleware } from '@mds-core/mds-api-server'
import Cloudevent, { event as cloudevent, BinaryHTTPReceiver } from 'cloudevents-sdk/v1'

export type EventHandler<TData, TResult> = (type: string, data: TData, event: Cloudevent) => Promise<TResult>

const tenantId = process.env.TENANT_ID ?? 'mds'

function decorateEventType(eventType: string) : string {
  // fixme: regex failed me; event.getType().replace(/^`${tenantId}`./, '')
  return eventType.startsWith(`${tenantId}.`) ? eventType.substring(tenantId.length + 1) : eventType
}

export const EventServer = <TData, TResult>(
  handler: EventHandler<TData, TResult>,
  server: express.Express = express()
): express.Express => {
  // Disable x-powered-by header
  server.disable('x-powered-by')

  const receiver = new BinaryHTTPReceiver()

  const parseCloudEvent = (req: express.Request): Cloudevent => {
    try {
      return receiver.parse(req.body, req.headers)
    } catch (error) {
      const [source, type] = [req.header('ce-source'), req.header('ce-type')]
      if (source && type) {
        return cloudevent()
          .source(source)
          .type(type)
          .data(req.body)
      }
      /* istanbul ignore next */
      throw error
    }
  }

  // Middleware
  server.use(JsonBodyParserMiddleware({ limit: '1mb' }))

  // Routes
  server.get(pathsFor('/'), AboutRequestHandler)

  server.get(pathsFor('/health'), HealthRequestHandler)

  server.post('/', async (req, res) => {
    try {
      const event = parseCloudEvent(req)
      await logger.info('PARSE Cloud Event', 'BODY:', req.body, 'HEADERS:', req.headers, 'EVENT:', event.format())
      const result = await handler(decorateEventType(event.getType()), event.getData(), event)
      return res.status(200).send({ result })
    } catch (error) /* istanbul ignore next */ {
      await logger.error('ERROR Cloud Event', 'BODY:', req.body, 'HEADERS:', req.headers, 'ERROR:', error)
      return res.status(500).send({ error: new ServerError(error, req.body) })
    }
  })

  return server
}