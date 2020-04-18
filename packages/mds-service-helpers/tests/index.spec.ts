/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import test from 'unit.js'
import { ServiceResult, ServiceError, ServiceException } from '../index'

describe('Tests Service Helpers', () => {
  it('Test ServiceResult', async () => {
    const { result } = ServiceResult('success')
    test.value(result).is('success')
  })

  it('Test ServiceError', async () => {
    const { error } = ServiceError({ type: 'ValidationError', message: 'Validation Error' })
    test.value(error.type).is('ValidationError')
    test.value(error.message).is('Validation Error')
    test.value(error.details).is(undefined)
  })

  it('Test ServiceException', async () => {
    const { error } = ServiceException('Validation Error', Error('Error Message'))
    test.value(error.type).is('ServiceException')
    test.value(error.message).is('Validation Error')
    test.value(error.details).is('Error Message')
  })
})
