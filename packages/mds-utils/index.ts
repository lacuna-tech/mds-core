import { v4 } from 'uuid'
import { UUID } from '@mds-core/mds-types'

export * from './exceptions/exceptions'
export * from './exceptions/exception-messages'
export * from './utils'
export * from './object-properties-parser'

export const uuid = (): UUID => v4()
