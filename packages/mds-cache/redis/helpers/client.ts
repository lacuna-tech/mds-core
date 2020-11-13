import Redis from 'ioredis'
import { cleanEnv, host, num } from 'envalid'
import logger from '@mds-core/mds-logger'

const { REDIS_PORT, REDIS_HOST, REDIS_PASS } = cleanEnv(process.env, {
  REDIS_PORT: num({ default: 6379 }),
  REDIS_HOST: host({ default: 'localhost' })
})

export const initClient = async () => {
  const client = new Redis({
    lazyConnect: true,
    maxRetriesPerRequest: 1000, // 20 is default, but that may not be long enough
    port: REDIS_PORT,
    host: REDIS_HOST,
    password: REDIS_PASS
  })
  client.on('connect', () => {
    logger.warn('connected, yay')
  })
  try {
    // try to connect; if fails initially, that's okay; we don't want to throw,
    // we want it to keep using its retry mechanism
    await client.connect()
  } catch (err) {
    // suppress initial connection failure
    logger.error('failed initial connect to redis, will keep trying')
    // log and keep going
  }
  return client
}
