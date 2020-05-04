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
import logger from '@mds-core/mds-logger'
import { pluralize } from '@mds-core/mds-utils'
import { ConnectionManager, ConnectionManagerOptions, ConnectionMode, ConnectionManagerCliOptions } from './connection'
import { CreateRepositoryMigration } from './migration'

export type RepositoryOptions = Pick<ConnectionManagerOptions, 'entities' | 'migrations'>

abstract class BaseRepository<TConnectionMode extends ConnectionMode> {
  protected readonly manager: ConnectionManager

  protected abstract initialize(): Promise<void>

  protected connect = async (mode: TConnectionMode): Promise<Omit<Connection, 'connect' | 'close'>> => {
    const { connect } = this.manager
    const connection = await connect(mode)
    return connection
  }

  protected abstract shutdown(): Promise<void>

  public cli = (mode: TConnectionMode, options: ConnectionManagerCliOptions) => {
    const { cli } = this.manager
    return cli(mode, options)
  }

  constructor(public readonly name: string, { entities, migrations }: Required<RepositoryOptions>) {
    const migrationsTableName = `${name}-migrations`
    this.manager = new ConnectionManager(name, {
      migrationsTableName,
      entities,
      migrations: migrations.length === 0 ? [] : [CreateRepositoryMigration(migrationsTableName), ...migrations]
    })
  }
}

export abstract class ReadOnlyRepository extends BaseRepository<'ro'> {
  public initialize = async (): Promise<void> => {
    const { name } = this
    logger.info(`Initializing R/O repository: ${name}`)
  }

  public shutdown = async (): Promise<void> => {
    const {
      name,
      manager: { disconnect }
    } = this
    logger.info(`Terminating R/O repository: ${name}`)
    await disconnect('ro')
  }

  constructor(name: string, { entities = [] }: Omit<RepositoryOptions, 'migrations'> = {}) {
    super(name, { entities, migrations: [] })
  }
}

export abstract class ReadWriteRepository extends BaseRepository<'ro' | 'rw'> {
  public initialize = async (): Promise<void> => {
    const {
      name,
      manager: { connect }
    } = this
    logger.info(`Initializing R/W repository: ${name}`)

    const {
      PG_MIGRATIONS = 'true' // Enable migrations by default
    } = process.env

    /* istanbul ignore if */
    if (PG_MIGRATIONS === 'true') {
      const connection = await connect('rw')
      const {
        options: { migrationsTableName }
      } = connection
      if (migrationsTableName) {
        const migrations = await connection.runMigrations({ transaction: 'all' })
        logger.info(
          `Ran ${migrations.length || 'no'} ${pluralize(
            migrations.length,
            'migration',
            'migrations'
          )} (${migrationsTableName})${
            migrations.length ? `: ${migrations.map(migration => migration.name).join(', ')}` : ''
          }`
        )
      }
    }
  }

  public shutdown = async (): Promise<void> => {
    const {
      name,
      manager: { disconnect }
    } = this
    logger.info(`Terminating R/W repository: ${name}`)
    await Promise.all([disconnect('rw'), disconnect('ro')])
  }

  constructor(name: string, { entities = [], migrations = [] }: RepositoryOptions = {}) {
    super(name, {
      entities,
      migrations
    })
  }
}
