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

import logger from '@mds-core/mds-logger'

class RepositoryError extends Error {
  private static hasProperty<T extends string>(property: T, error: unknown): error is { [P in T]: string } {
    return error instanceof Error && property in error
  }

  static GetProperty<T extends string>(property: T, error: unknown): string | undefined {
    return (RepositoryError.hasProperty(property, error) && error[property]) || undefined
  }

  constructor(message: string, public code?: string) {
    super(message)
    Error.captureStackTrace(this, RepositoryError)
    this.name = `RepositoryError${code ?? ''}`
  }
}

const isError = (error: unknown): error is Error => error instanceof Error

export const RepositoryException = (error: unknown): RepositoryError => {
  const exception = isError(error)
    ? new RepositoryError(
        RepositoryError.GetProperty('detail', error) ?? error.message,
        RepositoryError.GetProperty('code', error)
      )
    : new RepositoryError(typeof error === 'string' ? error : 'Unexpected Error')
  logger.error(exception)
  return exception
}

// Type guard to detect general repository errors
export const isRepositoryError = (error: unknown): error is RepositoryError => error instanceof RepositoryError

// Type guards to detect specific repository errors
// https://www.postgresql.org/docs/9.2/errcodes-appendix.html
export const isRepositoryUniqueViolationError = (error: unknown) => isRepositoryError(error) && error.code === '23505'
