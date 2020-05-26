import Sinon from 'sinon'
import assert from 'assert'
import stream, { WriteStream } from '..'
import { mockStream } from '../test-utils'

type FakeStreamPayload = 'foo'

describe('Mock stream API', () => {
  it('Mocks successfully', async () => {
    const fakeStream: WriteStream<FakeStreamPayload> = stream.KafkaStreamProducer<FakeStreamPayload>('fake-stream')
    const { initialize, write, shutdown } = mockStream(fakeStream)

    await fakeStream.initialize()
    assert.strictEqual(initialize.calledOnce, true)

    await fakeStream.write('foo')
    assert.strictEqual(write.calledOnceWithExactly('foo'), true)

    await fakeStream.shutdown()
    assert.strictEqual(shutdown.calledOnce, true)
  })

  it('Mocks with overrides successfully', async () => {
    const fakeStream: WriteStream<FakeStreamPayload> = stream.KafkaStreamProducer<FakeStreamPayload>('fake-stream')
    const overrideMocks = {
      initialize: Sinon.fake.resolves(undefined),
      shutdown: Sinon.fake.resolves(undefined),
      write: Sinon.fake.resolves(undefined)
    }
    mockStream(fakeStream, overrideMocks)

    const { initialize, write, shutdown } = overrideMocks

    await fakeStream.initialize()
    assert.strictEqual(initialize.calledOnce, true)

    await fakeStream.write('foo')
    assert.strictEqual(write.calledOnceWithExactly('foo'), true)

    await fakeStream.shutdown()
    assert.strictEqual(shutdown.calledOnce, true)
  })

  after(() => {
    Sinon.restore()
  })
})
