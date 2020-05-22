import Sinon from 'sinon'
import { WriteStream } from './types'

export const mockStream = <T>(stream: WriteStream<T>) => {
  const initialize = Sinon.fake.resolves(undefined)
  const shutdown = Sinon.fake.resolves(undefined)
  const write = Sinon.fake.resolves(undefined)

  Sinon.replace(stream, 'initialize', initialize)
  Sinon.replace(stream, 'shutdown', shutdown)
  Sinon.replace(stream, 'write', write)

  return { initialize, shutdown, write }
}
