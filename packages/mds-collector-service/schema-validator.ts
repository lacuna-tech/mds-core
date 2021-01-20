/* eslint-disable no-console */
import Ajv from 'ajv'
import withFormats from 'ajv-formats'

export const SchemaValidator = <S>(schema: S) => withFormats(new Ajv({ allErrors: true })).compile<S>(schema)
