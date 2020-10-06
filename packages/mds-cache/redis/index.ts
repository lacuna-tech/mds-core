import Redis, { KeyType, ValueType } from 'ioredis'
import { Nullable, Timestamp } from '@mds-core/mds-types'
import { isDefined, ClientDisconnectedError, ExceptionMessages } from '@mds-core/mds-utils'
import { initClient } from './helpers/client'
import { OrderedFields } from '../@types'

// /////////////////// start back-ported junk

export const RedisCache = () => {
  let client: Nullable<Redis.Redis> = null

  return {
    initialize: async () => {
      client = await initClient()
    },
    shutdown: async () => {
      if (isDefined(client)) {
        client.disconnect()
      }
      client = null
    },
    multi: async () => {
      if (isDefined(client)) {
        return client.multi()
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    get: async (key: KeyType) => {
      if (isDefined(client)) {
        return client.get(key)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    set: async (key: KeyType, val: ValueType) => {
      if (isDefined(client)) {
        return client.set(key, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    expireAt: async (key: KeyType, time: Timestamp) => {
      if (isDefined(client)) {
        return client.expireat(key, time)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    dbsize: async () => {
      if (isDefined(client)) {
        return client.dbsize()
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    del: async (...keys: KeyType[]) => {
      if (isDefined(client)) {
        return client.del(keys)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    flushdb: async () => {
      if (isDefined(client)) {
        return client.flushdb()
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    sadd: async (key: KeyType, val: ValueType) => {
      if (isDefined(client)) {
        return client.sadd(key, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    srem: async (key: KeyType, val: ValueType) => {
      if (isDefined(client)) {
        return client.srem(key, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    smembers: async (key: KeyType) => {
      if (isDefined(client)) {
        return client.smembers(key)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    lpush: async (key: KeyType, val: ValueType) => {
      if (isDefined(client)) {
        return client.lpush(key, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    rpush: async (key: KeyType, val: ValueType) => {
      if (isDefined(client)) {
        return client.rpush(key, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    lrange: async (key: KeyType, min: number, max: number) => {
      if (isDefined(client)) {
        return client.lrange(key, min, max)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    hset: async (key: KeyType, field: string, val: ValueType) => {
      if (isDefined(client)) {
        return client.hset(key, field, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    hdel: async (key: KeyType, ...fields: KeyType[]) => {
      if (isDefined(client)) {
        return client.hdel(key, fields)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    hgetall: async (key: KeyType) => {
      if (isDefined(client)) {
        return client.hgetall(key)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    info: async () => {
      if (isDefined(client)) {
        return client.info()
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    keys: async (pattern: string) => {
      if (isDefined(client)) {
        return client.keys(pattern)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    zadd: async (key: KeyType, fields: OrderedFields | (string | number)[]) => {
      if (isDefined(client)) {
        const entries: (string | number)[] = !Array.isArray(fields)
          ? Object.entries(fields).reduce((acc: (number | string)[], [field, value]) => {
              return [...acc, value, field]
            }, [])
          : fields
        return client.zadd(key, ...entries)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    zrem: async (key: KeyType, val: ValueType) => {
      if (isDefined(client)) {
        return client.zrem(key, val)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    zrangebyscore: async (key: KeyType, min: string | number, max: string | number) => {
      if (isDefined(client)) {
        return client.zrangebyscore(key, min, max)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    georadius: async (key: KeyType, longitude: number, latitude: number, radius: number, unit: string) => {
      if (isDefined(client)) {
        return client.georadius(key, longitude, latitude, radius, unit)
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    },
    /* TODO: Improve multi call response structure */
    multihgetall: async (key: KeyType) => {
      if (isDefined(client)) {
        return client.multi().hgetall(key).exec()
      }
      throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
    }
  }
}
