import Joi from 'joi'
import { ValidationError } from '@mds-core/mds-utils'
import { GeographyDomainModel } from '../@types'

// FIXME: Add proper schema
export const geographyDomainModelSchema = Joi.any()

export const ValidateGeographyDomainModel = (geography: GeographyDomainModel): GeographyDomainModel => {
  const { error } = geographyDomainModelSchema.validate(geography)
  if (error) {
    throw new ValidationError(error.message, geography)
  }
  return geography
}
