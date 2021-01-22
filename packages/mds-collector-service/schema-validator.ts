import Ajv, { Options } from 'ajv'
import withFormats from 'ajv-formats'

export const SchemaValidator = <Schema>(schema: Schema, options: Options = { allErrors: true }) => {
  return withFormats(new Ajv(options)).compile<Schema>(schema)
}
