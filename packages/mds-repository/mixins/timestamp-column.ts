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

import { Column } from 'typeorm'
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions'
import { ColumnWithWidthOptions } from 'typeorm/decorator/options/ColumnWithWidthOptions'
import { Timestamp } from '@mds-core/mds-types'
import { BigintTransformer } from '../transformers'
import { AnyConstructor, Mixin } from '../@types'

export const TimestampColumn = <T extends AnyConstructor>(
  EntityClass: T,
  options: ColumnWithWidthOptions & ColumnCommonOptions = {}
) => {
  abstract class TimestampColumnMixin extends EntityClass {
    @Column('bigint', {
      transformer: BigintTransformer,
      default: () => '(extract(epoch from now()) * 1000)::bigint',
      ...options
    })
    timestamp: Timestamp
  }
  return TimestampColumnMixin
}

export type TimestampColumn = Mixin<typeof TimestampColumn>
