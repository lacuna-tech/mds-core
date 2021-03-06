/**
 * Copyright 2019 City of Los Angeles
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

import test from 'unit.js'
import { BigintTransformer, UppercaseTransformer } from '../transformers'

describe('Test Transformers', () => {
  it('BigIntTransformer', done => {
    test.value(BigintTransformer.to(1)).is(1)
    test.value(BigintTransformer.to(null)).is(null)
    test.value(BigintTransformer.to([1, null])).is([1, null])
    test.value(BigintTransformer.from('1')).is(1)
    test.value(BigintTransformer.from(null)).is(null)
    test.value(BigintTransformer.from(['1', null])).is([1, null])
    done()
  })

  it('UppercaseTransformer', done => {
    test.value(UppercaseTransformer.to('a')).is('A')
    test.value(UppercaseTransformer.to('A')).is('A')
    test.value(UppercaseTransformer.to(null)).is(null)
    test.value(UppercaseTransformer.to(['a', 'A', null])).is(['A', 'A', null])
    test.value(UppercaseTransformer.from('a')).is('A')
    test.value(UppercaseTransformer.from('A')).is('A')
    test.value(UppercaseTransformer.from(null)).is(null)
    test.value(UppercaseTransformer.from(['a', 'A', null])).is(['A', 'A', null])
    done()
  })
})
