import { KeyType } from 'ioredis'

declare module 'ioredis' {
  interface Redis {
    geoadd: (key: KeyType, longitude: number, latitude: number, member: KeyType) => Promise<string[]>
    georadius: (key: KeyType, longitude: number, latitude: number, radius: number, unit: string) => Promise<string[]>
    hset: OverloadedKeyedHashCommand<ValueType, Ok>
  }
}

export { KeyType } from 'ioredis'
export type OrderedFields = { [key: string]: number }
