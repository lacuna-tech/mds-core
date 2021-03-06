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

import { AnyConstructor, Timestamp } from '@mds-core/mds-types'
import { Column, Index } from 'typeorm'
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions'
import { ColumnWithWidthOptions } from 'typeorm/decorator/options/ColumnWithWidthOptions'
import { BigintTransformer } from '../transformers'

export interface RecordedColumn {
  recorded: Timestamp
}

export const RecordedColumn = <T extends AnyConstructor>(
  EntityClass: T,
  options: ColumnWithWidthOptions & ColumnCommonOptions = {}
) => {
  abstract class RecordedColumnMixin extends EntityClass implements RecordedColumn {
    @Column('bigint', {
      transformer: BigintTransformer,
      default: () => '(extract(epoch from now()) * 1000)::bigint',
      ...options
    })
    @Index()
    recorded: Timestamp
  }
  return RecordedColumnMixin
}
