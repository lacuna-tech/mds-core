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

import { SingleOrArray } from '@mds-core/mds-types'
import { In } from 'typeorm'
import logger from '@mds-core/mds-logger'
import { RuntimeError } from '@mds-core/mds-utils'

export const entityPropertyFilter = <T extends object, TProperty extends keyof T>(
  property: TProperty,
  value: SingleOrArray<T[TProperty]> | undefined
) => {
  if (value) {
    if (Array.isArray(value)) {
      if (value.length) {
        return value.length === 1 ? { [property]: value[0] } : { [property]: In(value) }
      }
    } else {
      return { [property]: value }
    }
  }
  return {}
}

export const RepositoryError = (message: string, error?: unknown) => {
  logger.error(message, error)
  return new RuntimeError(message, error)
}
