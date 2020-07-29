import { isStringArray } from './utils'

/** A single-value (string) parser. Useful for standard transformations, e.g.:
 * - { fn: Number }
 * - { fn: String }
 * - { fn: JSON.parse, type: 'string' }
 */
export type SingleParser<T> = {
  fn: (value: string) => T
  type?: 'single'
}

/** A multi-value (array) parser. Useful for more complex transformations, e.g.:
 * - Input cleansing: { fn: (xs) => { xs.map(Number).filter(x => x > 0) }, type: 'array' }
 */
export type ArrayParser<T> = {
  fn: (value: string[]) => T[]
  type: 'array'
}

/* For use with the parseObjectProperties method */
export type ObjectParser<T> = SingleParser<T> | ArrayParser<T>

export type ParseObjectPropertiesOptions<T> = Partial<{
  parser: ObjectParser<T>
}>

/**
 * Takes a given object, and applies transformations in a type-safe way.
 * Intended primarily for use with Express Query/Param objects, to allow
 * easy transformation and usage via destructuring in API code.
 * @constructor
 * @param obj - The object to parse
 * @param options - Defines the object parser options.
 */
export const parseObjectProperties = <T = string>(
  obj: { [k: string]: unknown },
  { parser }: ParseObjectPropertiesOptions<T> = {}
) => {
  return {
    keys: <TKey extends string>(first: TKey, ...rest: TKey[]) =>
      [first, ...rest]
        .map(key => ({ key, value: obj[key] }))
        .reduce((params, { key, value }) => {
          if (typeof value === 'string') {
            /* If parser type set to 'single' or not set, we assume use of the single parser */
            if (parser?.type === 'single' || (parser && parser.type === undefined)) {
              return { ...params, [key]: [parser.fn(value)] }
            }
            if (parser?.type === 'array') {
              return { ...params, [key]: parser.fn([value]) }
            }
            return { ...params, [key]: [value] }
          }
          if (isStringArray(value)) {
            /* If parser type set to 'single' or not set, we assume use of the single parser */
            if (parser?.type === 'single' || (parser && parser.type === undefined)) {
              return { ...params, [key]: value.map(parser.fn) }
            }
            if (parser?.type === 'array') {
              return { ...params, [key]: parser.fn(value) }
            }
            return { ...params, key: value }
          }
          return { ...params, [key]: [] }
        }, {}) as { [P in TKey]: (T | undefined)[] }
  }
}
