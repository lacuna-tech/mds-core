import Joi from 'joi'
import { ValidationError } from '@mds-core/mds-utils'
import { AuditDomainModel } from '../@types'

const schemaValidator = <T>(schema: Joi.AnySchema) => ({
  validate: (value: unknown): T => {
    const { error } = schema.validate(value)
    if (error) {
      throw new ValidationError(error.message, value)
    }
    return value as T
  },
  isValid: (value: unknown): value is T => !schema.validate(value).error
})

/*
  audit_trip_id: UUID
  audit_device_id: UUID
  audit_subject_id: string
  provider_id: UUID
  provider_name: string
  provider_vehicle_id: string
  provider_device_id: Nullable<UUID>
  */

export const { validate: validateAuditDomainModel, isValid: isValidAuditDomainModel } = schemaValidator<
  AuditDomainModel
>(
  Joi.object<AuditDomainModel>()
    .keys({
      audit_trip_id: Joi.string().uuid().required(),
      audit_device_id: Joi.string().uuid().required(),
      audit_subject_id: Joi.string().required(),
      provider_id: Joi.string().uuid().required(),
      provider_name: Joi.string().required(),
      provider_vehicle_id: Joi.string().required(),
      provider_device_id: Joi.string().uuid().allow(null)
    })
    .unknown(false)
)
