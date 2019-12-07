/* eslint-disable promise/prefer-await-to-callbacks */
import http from 'http'
import log from '@mds-core/mds-logger'

const { env } = process

async function dataHandler(
  type: string,
  // eslint-disable-next-line promise/prefer-await-to-callbacks, @typescript-eslint/no-explicit-any
  callback: { (type: any, data: any): Promise<any>; (arg0: any, arg1: any): void }
) {
  log.info('Creating server...')
  const server = http.createServer((req, res) => {
    const { method } = req
    if (method === 'POST') {
      let body = ''
      req.on('data', (data: string) => {
        body += data
      })
      req.on('end', () => {
        const contentType = req.headers['content-type'] ?? ''
        const parsedContentType =
          contentType?.indexOf(';') >= 0 ? contentType.substring(0, contentType.indexOf(';')) : contentType
        const parsedBody = JSON.parse(body)

        if (parsedContentType === 'application/json') {
          // binary
          const ce_data: { [x: string]: any } = {
            type: req.headers['ce-type'],
            specversion: req.headers['ce-specversion'],
            source: req.headers['ce-source'],
            id: req.headers['ce-id'],
            data: parsedBody
          }

          /* eslint-reason FIXME need to refactor */
          /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
          callback(ce_data.type, ce_data.data)
        } else if (type === 'application/cloudevents+json') {
          // structured
          /* eslint-reason FIXME need to refactor */
          /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
          callback(parsedBody.type, parsedBody.data)
        }

        res.statusCode = 200
        res.end()
      })
    } else if (req.method === 'GET') {
      res.statusCode = 404
      res.end()
    }
  })
  log.info(`listening on ${env.PORT}...`)
  server.listen(env.PORT || 4000)
}
export { dataHandler }
