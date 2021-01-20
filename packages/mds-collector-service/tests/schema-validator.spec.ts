import { SchemaValidator } from '../schema-validator'
import TestSchema from './test.schema'

const TestData = {
  country: 'US',
  id: '26eea094-3fc2-4610-839d-6ef018b46f81',
  name: 'Test',
  zip: '90210',
  email: 'test@test.com',
  timestamp: Date.now()
}

const validate = SchemaValidator(TestSchema)

describe('Schema Validation', () => {
  it('Passes Validation', () => {
    expect(validate(TestData)).toBeTruthy()
    expect(validate.errors).toBeNull()
  })

  it('Passes Validation (optional field)', () => {
    const { email, ...data } = TestData
    expect(validate(data)).toBeTruthy()
    expect(validate.errors).toBeNull()
  })

  it('Fails Validation (missing required field)', () => {
    const { id, ...data } = TestData
    expect(validate(data)).toBe(false)
    expect(validate.errors?.find(error => error.keyword === 'required')).toMatchObject({
      params: { missingProperty: 'id' }
    })
  })

  it('Fails Validation (invalid email)', () => {
    const data = { ...TestData, email: 'invalid' }
    expect(validate(data)).toBeFalsy()
    expect(validate.errors?.find(error => error.dataPath === '/email')).toMatchObject({ keyword: 'format' })
  })

  it('Fails Validation (invalid enum)', () => {
    const data = { ...TestData, country: 'NZ' }
    expect(validate(data)).toBeFalsy()
    expect(validate.errors?.find(error => error.dataPath === '/country')).toMatchObject({
      keyword: 'enum'
    })
    expect(validate.errors?.find(error => error.dataPath === '/zip')).toMatchObject({
      keyword: 'pattern'
    })
  })

  it('Fails Validation (invalid US zip)', () => {
    const data = { ...TestData, zip: 99999 }
    expect(validate(data)).toBeFalsy()
    expect(validate.errors?.find(error => error.dataPath === '/zip')).toMatchObject({ keyword: 'type' })
  })

  it('Fails Validation (invalid CA postal code)', () => {
    const data = { ...TestData, country: 'CA' }
    expect(validate(data)).toBeFalsy()
    expect(validate.errors?.find(error => error.dataPath === '/zip')).toMatchObject({ keyword: 'pattern' })
  })

  it('Returns JSON schema', () => {
    expect(validate.schema).toMatchObject(TestSchema)
  })
})
