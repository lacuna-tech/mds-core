/*
    Copyright 2019 City of Los Angeles.

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
import { ModelMapper } from '../mapper'

const stringify = ModelMapper<number, string, Partial<{ multiplier: number }>>((from, options) => {
  const { multiplier = 1 } = options ?? {}
  return `${from * multiplier}`
})

describe('Test CreateModelMapper', () => {
  it('Without Options', done => {
    test.value(stringify.map(1)).is('1')
    test.value([1, 2].map(stringify.mapper())).is(['1', '2'])
    done()
  })

  it('With Options', done => {
    test.value(stringify.map(1, { multiplier: 2 })).is('2')
    test.value([1, 2].map(stringify.mapper({ multiplier: 2 }))).is(['2', '4'])
    done()
  })
})
