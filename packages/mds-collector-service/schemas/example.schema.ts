import { JSONSchemaType } from 'ajv'

type ExampleSchema = {
  name: string
  email?: string
}

const ExampleSchema: JSONSchemaType<ExampleSchema> = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email',
      nullable: true
    }
  },
  required: ['name']
}

export default ExampleSchema
