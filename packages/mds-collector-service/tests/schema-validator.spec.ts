/**
 * Copyright 2021 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SchemaValidator } from '../schema-validator'
import TestSchema from '../schemas/test.schema'

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

  it('Fails Validation (invalid format)', () => {
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
  })

  it('Fails Validation (invalid type)', () => {
    const data = { ...TestData, zip: true }
    expect(validate(data)).toBeFalsy()
    expect(validate.errors?.find(error => error.dataPath === '/zip')).toMatchObject({ keyword: 'type' })
  })

  it('Fails Validation (invalid pattern)', () => {
    const data = { ...TestData, country: 'CA' }
    expect(validate(data)).toBeFalsy()
    expect(validate.errors?.find(error => error.dataPath === '/zip')).toMatchObject({ keyword: 'pattern' })
  })

  it('Returns JSON schema', () => {
    expect(validate.schema).toMatchObject(TestSchema)
  })
})
