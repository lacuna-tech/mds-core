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

import { Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper, RecordedColumn } from '@mds-core/mds-repository'
import { EventAnnotationDomainCreateModel, EventAnnotationDomainModel } from '../../@types'
import { EventAnnotationEntityModel } from '../entities/event-annotation-entity'

type EventAnnotationEntityToDomainOptions = Partial<{}>

export const EventAnnotationEntityToDomain = ModelMapper<
  EventAnnotationEntityModel,
  EventAnnotationDomainModel,
  EventAnnotationEntityToDomainOptions
>((entity, options) => {
  const { id, ...domain } = entity
  return { ...domain }
})

type EventAnnotationEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type EventAnnotationEntityCreateModel = Omit<
  EventAnnotationEntityModel,
  keyof IdentityColumn | keyof RecordedColumn
>

export const EventAnnotationDomainToEntityCreate = ModelMapper<
  EventAnnotationDomainCreateModel,
  EventAnnotationEntityCreateModel,
  EventAnnotationEntityCreateOptions
>(({ ...domain }, options) => {
  const { recorded } = options ?? {}
  return { recorded, ...domain }
})
