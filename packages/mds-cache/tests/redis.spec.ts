import { ClientDisconnectedError, now, hours, ExceptionMessages } from '@mds-core/mds-utils'
import { RedisCache } from '../redis'

const redis = RedisCache()

describe('Redis Tests', () => {
  beforeAll(async () => {
    await redis.initialize()
  })

  describe('Client Method Tests', () => {
    afterAll(async () => {
      await redis.shutdown()
    })

    afterEach(async () => {
      await redis.flushdb()
    })

    it('set()', async () => {
      const res = await redis.set('foo', 'bar')
      expect(res).toEqual('OK')
    })

    it('get()', async () => {
      await redis.set('foo', 'bar')
      const res = await redis.get('foo')
      expect(res).toEqual('bar')
    })

    it('dbsize()', async () => {
      const res = await redis.dbsize()
      expect(res).toEqual(0)
    })

    it('del() single key', async () => {
      await redis.set('foo', 'bar')
      const res = await redis.del('foo')
      expect(res).toEqual(1)
    })

    it('del() multiple keys', async () => {
      await redis.set('foo', 'bar')
      await redis.set('baz', 'qux')
      const res = await redis.del('foo', 'baz')
      expect(res).toEqual(2)
    })

    it('hset()', async () => {
      const res = await redis.hset('foo', 'bar', 'baz')
      expect(res).toEqual(1)
    })

    it('hmset()', async () => {
      await redis.hmset('foo', { bar: 'baz' })
      const res = await redis.hgetall('foo')
      expect(res).toEqual({ bar: 'baz' })
    })

    it('hdel() single field', async () => {
      await redis.hset('foo', 'bar', 'baz')
      const res = await redis.hdel('foo', 'bar')
      expect(res).toEqual(1)
    })

    it('hdel() multiple fields', async () => {
      await redis.hset('foo', 'bar', 'baz')
      await redis.hset('foo', 'bip', 'bap')
      const res = await redis.hdel('foo', 'bar', 'bip')
      expect(res).toEqual(2)
    })

    it('hgetall()', async () => {
      await redis.hset('foo', 'bar', 'baz')
      await redis.hset('foo', 'qux', 'quux')
      const res = await redis.hgetall('foo')

      expect(res).toEqual({ bar: 'baz', qux: 'quux' })
      expect(res.qux).toEqual('quux')
    })

    it('info()', async () => {
      const res = await redis.info()
      expect(typeof res).toEqual('string')
    })

    it('keys() empty db', async () => {
      const res = await redis.keys('*')
      expect(res.length).toEqual(0)
    })

    it('keys() populated db', async () => {
      await redis.set('foo', 'bar')
      const res = await redis.keys('*')
      expect(res.length).toEqual(1)
    })

    it('zadd()', async () => {
      await expect(redis.zadd('foo', { bar: 1, baz: 2 })).resolves.toEqual(2)
      await expect(redis.zadd('foo', [3, 'boot', 4, 'bat'])).resolves.toEqual(2)
    })

    it('zrangebyscore()', async () => {
      await redis.zadd('foo', { bar: 1, baz: 2 })
      await expect(redis.zrangebyscore('foo', 0, 2)).resolves.toEqual(['bar', 'baz'])
    })

    it('multihgetall()', async () => {
      await redis.hset('foo', 'bar', 'baz')
      await redis.hset('foo', 'qux', 'quux')
      const res = await redis.multihgetall('foo')

      if (!res) throw new Error('Res should be defined')
      const [[, realRes]] = res
      expect(realRes).toEqual({ bar: 'baz', qux: 'quux' })
    })

    describe('Set api', () => {
      it('sadd() + smembers() + srem()', async () => {
        await redis.sadd('foo', 'bar')
        await expect(redis.smembers('foo')).resolves.toContain('bar')
        await redis.srem('foo', 'bar')
        await expect(redis.smembers('foo')).resolves.toEqual([])
      })
    })
  })

  describe('Null Client tests', () => {
    beforeAll(async () => {
      await redis.shutdown()
    })

    afterAll(async () => {
      await redis.shutdown()
    })

    it('set()', async () => {
      await expect(redis.set('foo', 'bar')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('get()', async () => {
      await expect(redis.get('foo')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('dbsize()', async () => {
      await expect(redis.dbsize()).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('del()', async () => {
      await expect(redis.del('foo')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('hset()', async () => {
      await expect(redis.hset('foo', 'bar', 'baz')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('hdel()', async () => {
      await expect(redis.hdel('foo', 'bar')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('hgetall()', async () => {
      await expect(redis.hgetall('foo')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('info()', async () => {
      await expect(redis.info()).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('keys()', async () => {
      await expect(redis.keys('*')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('keys()', async () => {
      await expect(redis.keys('*')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('zadd()', async () => {
      await expect(redis.zadd('foo', { bar: 1, baz: 2 })).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('zrangebyscore()', async () => {
      await expect(redis.zrangebyscore('foo', 0, 2)).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('multihgetall()', async () => {
      await expect(redis.multihgetall('foo')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('sadd()', async () => {
      await expect(redis.sadd('foo', 'bar')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('srem()', async () => {
      await expect(redis.srem('foo', 'bar')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('smembers()', async () => {
      await expect(redis.smembers('foo')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('expireAt()', async () => {
      await expect(redis.expireAt('foo', now() + hours(1))).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('lpush()', async () => {
      await expect(redis.lpush('foo', 'okay')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('rpush()', async () => {
      await expect(redis.rpush('foo', 'okay')).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('lrange()', async () => {
      await expect(redis.lrange('foo', 0, -1)).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })

    it('zrem()', async () => {
      await expect(redis.zrem('foo', 10)).rejects.toEqual(
        new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
      )
    })
  })
})
