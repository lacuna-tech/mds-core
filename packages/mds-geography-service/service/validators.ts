/**
 * Copyright 2020 City of Los Angeles
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

import { schemaValidator } from '@mds-core/mds-schema-validators'
import gjv from 'geojson-validation'
import Joi from 'joi'
import {
  GeographyDomainCreateModel,
  GeographyMetadataDomainCreateModel,
  GetGeographiesOptions,
  GetPublishedGeographiesOptions
} from '../@types'

export const { validate: validateGeographyDomainCreateModel, isValid: isValidGeographyDomainCreateModel } =
  schemaValidator<GeographyDomainCreateModel>(
    Joi.object<GeographyDomainCreateModel>()
      .keys({
        geography_id: Joi.string().uuid().required(),
        name: Joi.string().max(255).allow(null),
        description: Joi.string().max(255).allow(null),
        effective_date: Joi.number().integer().allow(null),
        publish_date: Joi.number().integer().allow(null),
        prev_geographies: Joi.array().items(Joi.string().uuid()).allow(null),
        geography_json: Joi.custom((geography_json, helpers) => {
          try {
            const [error] = gjv.valid(geography_json, true)
            if (error !== undefined) {
              return helpers.message({ custom: `GeoJSON is invalid ${error}` })
            }
          } catch (error) {
            return helpers.message({ custom: `GeoJSON could not be validated` })
          }
          return geography_json
        }).required()
      })
      .unknown(false)
  )

export const {
  validate: validateGeographyMetadataDomainCreateModel,
  isValid: isValidGeographyMetadataDomainCreateModel
} = schemaValidator<GeographyMetadataDomainCreateModel>(
  Joi.object<GeographyMetadataDomainCreateModel>()
    .keys({
      geography_id: Joi.string().uuid().required(),
      geography_metadata: Joi.any().allow(null)
    })
    .unknown(false)
)

export const { validate: validateGetGeographiesOptions, isValid: isValidGetGeographiesOptions } =
  schemaValidator<GetGeographiesOptions>(
    Joi.object<GetGeographiesOptions>()
      .keys({
        includeMetadata: Joi.boolean().default(false)
      })
      .unknown(false)
  )

export const { validate: validateGetPublishedGeographiesOptions, isValid: isValidGetPublishedGeographiesOptions } =
  schemaValidator<GetPublishedGeographiesOptions>(
    Joi.object<GetPublishedGeographiesOptions>()
      .keys({
        includeMetadata: Joi.boolean().default(false),
        publishedAfter: Joi.number().integer()
      })
      .unknown(false)
  )
