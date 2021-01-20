import { JSONSchemaType } from 'ajv'

const Countries = <const>['US', 'CA']
type Country = typeof Countries[number]

type TestSchema = {
  id: string
  name: string
  email?: string
  country: Country
  zip: string
  timestamp: number
}

const TestSchema: JSONSchemaType<TestSchema> = {
  $schema: 'http://json-schema.org/draft-07/schema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid'
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email',
      nullable: true
    },
    country: {
      type: 'string',
      enum: [...Countries]
    },
    zip: {
      type: 'string'
    },
    timestamp: {
      type: 'number'
    }
  },
  if: {
    properties: {
      country: {
        type: 'string',
        const: 'US'
      }
    }
  },
  then: {
    properties: {
      zip: {
        type: 'string',
        pattern: '^[0-9]{5}(-[0-9]{4})?$'
      }
    }
  },
  else: {
    properties: {
      zip: {
        type: 'string',
        pattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$'
      }
    }
  },
  required: ['id', 'name', 'timestamp', 'country', 'zip']
}

export default TestSchema
