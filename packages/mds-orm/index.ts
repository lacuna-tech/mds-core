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

import { Connection } from 'typeorm'
import { ConnectionManager, ConnectionManagerOptions, ConnectionMode } from './connection-manager'

export type ReadWriteRepositoryOptions = Pick<
  ConnectionManagerOptions,
  'entities' | 'migrations' | 'migrationsTableName'
>

export const ReadWriteRepository = <TRepositoryMethods>(
  prefix: string,
  methods: (connect: (mode: ConnectionMode) => Promise<Connection>) => TRepositoryMethods,
  options: ReadWriteRepositoryOptions = {}
) => {
  const { getConnectionForMode, ...manager } = ConnectionManager(prefix, options)
  return {
    ...manager,
    ...methods(getConnectionForMode)
  }
}
