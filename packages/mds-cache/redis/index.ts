import Redis, { KeyType, OverloadedKeyedHashCommand, ValueType } from 'ioredis'
import { Nullable, Timestamp } from '@mds-core/mds-types'
import { isDefined, ClientDisconnectedError, ExceptionMessages } from '@mds-core/mds-utils'
import { initClient } from './helpers/client'
import { OrderedFields } from '../@types'

// /////////////////// start back-ported junk

export const RedisCache = () => {
  let client: Nullable<Redis.Redis> = null

  /**
   * If the client is defined, the closure is called, otherwise throws an error
   * @param exec called with a Redis client, returns the result
   * @returns same as what the exec returns
   * @throws ClientDisconnectedError
   */

  const safelyExec = async <T>(exec: (theClient: Redis.Redis) => T) => {
    if (isDefined(client)) {
      return exec(client)
    }
    throw new ClientDisconnectedError(ExceptionMessages.INITIALIZE_CLIENT_MESSAGE)
  }

  return {
    initialize: async () => {
      if (client) {
        await client.disconnect()
      }
      client = await initClient()
    },
    shutdown: async () => {
      if (isDefined(client)) {
        client.disconnect()
      }
      client = null
    },
    multi: async () => {
      return safelyExec(theClient => {
        return theClient.multi()
      })
    },
    get: async (key: KeyType) => {
      return safelyExec(theClient => {
        return theClient.get(key)
      })
    },
    set: async (key: KeyType, val: ValueType) => {
      return safelyExec(theClient => {
        return theClient.set(key, val)
      })
    },
    expireat: async (key: KeyType, time: Timestamp) => {
      return safelyExec(theClient => {
        return theClient.expireat(key, time)
      })
    },
    dbsize: async () => {
      return safelyExec(theClient => {
        return theClient.dbsize()
      })
    },
    del: async (...keys: KeyType[]) => {
      return safelyExec(theClient => {
        return theClient.del(keys)
      })
    },
    flushdb: async () => {
      return safelyExec(theClient => {
        return theClient.flushdb()
      })
    },
    sadd: async (key: KeyType, val: ValueType) => {
      return safelyExec(theClient => {
        return theClient.sadd(key, val)
      })
    },
    srem: async (key: KeyType, val: ValueType) => {
      return safelyExec(theClient => {
        return theClient.srem(key, val)
      })
    },
    smembers: async (key: KeyType) => {
      return safelyExec(theClient => {
        return theClient.smembers(key)
      })
    },
    lpush: async (key: KeyType, val: ValueType) => {
      return safelyExec(theClient => {
        return theClient.lpush(key, val)
      })
    },
    rpush: async (key: KeyType, val: ValueType) => {
      return safelyExec(theClient => {
        return theClient.rpush(key, val)
      })
    },
    lrange: async (key: KeyType, min: number, max: number) => {
      return safelyExec(theClient => {
        return theClient.lrange(key, min, max)
      })
    },
    hset: async (
      key: KeyType,
      ...data: [{ [key: string]: ValueType }] | [KeyType, ValueType][] | [KeyType, ValueType]
    ) => {
      const isTupleArr = (d: unknown[]): d is [KeyType, ValueType][] => Array.isArray(d[0])

      const isSingleTuple = (d: unknown[]): d is [KeyType, ValueType] => typeof d[0] === 'string'

      return safelyExec(theClient => {
        if (isTupleArr(data)) {
          return theClient.hset(key, ...data.flat())
        }

        if (isSingleTuple(data)) {
          return theClient.hset(key, ...data)
        }

        const [first] = data
        // We know that data is a [{ [key: string]: ValueType }]
        return theClient.hset(key, first)
      })
    },
    hmset: async (key: KeyType, data: { [key: string]: ValueType }) => {
      return safelyExec(theClient => {
        return theClient.hmset(key, data)
      })
    },
    hdel: async (key: KeyType, ...fields: KeyType[]) => {
      return safelyExec(theClient => {
        return theClient.hdel(key, fields)
      })
    },
    hgetall: async (key: KeyType) => {
      return safelyExec(theClient => {
        return theClient.hgetall(key)
      })
    },
    info: async () => {
      return safelyExec(theClient => {
        return theClient.info()
      })
    },
    keys: async (pattern: string) => {
      return safelyExec(theClient => {
        return theClient.keys(pattern)
      })
    },
    zadd: async (key: KeyType, fields: OrderedFields | (string | number)[]) => {
      return safelyExec(theClient => {
        const entries: (string | number)[] = !Array.isArray(fields)
          ? Object.entries(fields).reduce((acc: (number | string)[], [field, value]) => {
              return [...acc, value, field]
            }, [])
          : fields
        return theClient.zadd(key, ...entries)
      })
    },
    zrem: async (key: KeyType, val: ValueType) => {
      return safelyExec(theClient => {
        return theClient.zrem(key, val)
      })
    },
    zrangebyscore: async (key: KeyType, min: string | number, max: string | number) => {
      return safelyExec(theClient => {
        return theClient.zrangebyscore(key, min, max)
      })
    },
    geoadd: async (key: KeyType, longitude: number, latitude: number, member: KeyType) => {
      return safelyExec(theClient => {
        return theClient.geoadd(key, longitude, latitude, member)
      })
    },
    georadius: async (key: KeyType, longitude: number, latitude: number, radius: number, unit: string) => {
      return safelyExec(theClient => {
        return theClient.georadius(key, longitude, latitude, radius, unit)
      })
    },
    /* TODO: Improve multi call response structure */
    multihgetall: async (key: KeyType) => {
      return safelyExec(theClient => {
        return theClient.multi().hgetall(key).exec()
      })
    }
  }
}
