import { Message, Type, Field } from 'protobufjs/light'
import { Nullable, VEHICLE_TYPE } from '@mds-core/mds-types'
import { MetricDomainModel } from './@types'

@Type.d()
export class MetricDomainModelMessage extends Message<MetricDomainModel> {
  @Field.d(1, 'string', 'required')
  provider_id: string

  @Field.d(2, 'string', 'optional', undefined)
  geography_id: Nullable<string>

  @Field.d(3, 'string', 'required')
  vehicle_type: VEHICLE_TYPE

  @Field.d(4, 'string', 'required')
  name: string

  @Field.d(5, 'int32', 'required')
  time_bin_size: number

  @Field.d(6, 'double', 'required')
  time_bin_start: number

  @Field.d(7, 'double', 'required')
  count: number

  @Field.d(8, 'double', 'required')
  sum: number

  @Field.d(9, 'double', 'required')
  min: number

  @Field.d(10, 'double', 'required')
  max: number

  @Field.d(11, 'double', 'required')
  avg: number
}

// example code
const message = new MetricDomainModelMessage({ count: Date.now(), max: Number.MAX_SAFE_INTEGER, avg: Date.now() / 7.5 })
console.log(message)
const buffer = MetricDomainModelMessage.encode(message).finish()
console.log(buffer)
const decoded = MetricDomainModelMessage.decode(buffer)
console.log(decoded)
