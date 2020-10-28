import Joi from 'joi'
import { ValidationError } from '@mds-core/mds-utils'
import { numberSchema, vehicleEventTypeSchema, vehicleStatusSchema } from '@mds-core/mds-schema-validators'
import { ComplianceSnapshotDomainModel } from '../@types'

const policySchema = Joi.object().keys({
  policy_id: Joi.string().uuid().required(),
  name: Joi.string().required()
})

const matchedVehicleInformationSchema = Joi.object().keys({
  device_id: Joi.string().uuid(),
  rule_applied: Joi.string().uuid(),
  rules_matched: Joi.array().items(Joi.string().uuid()),
  state: vehicleStatusSchema.required(),
  event_types: Joi.array().items(vehicleEventTypeSchema).required(),
  timestamp: Joi.number().required(),
  gps: Joi.object().keys({
    lat: numberSchema.min(-90).max(90).required(),
    lng: numberSchema.min(-180).max(180).required()
  }),
  speed: Joi.number()
})

export const ComplianceSnapshotDomainModelSchema = Joi.object().keys({
  compliance_snapshot_id: Joi.string().uuid().required().error(Error('compliance_snapshot_id is missing')),
  compliance_as_of: Joi.number().integer().required().error(Error('compliance_as_of is missing')),
  provider_id: Joi.string().uuid().required().error(Error('provider_id is missing')),
  policy: policySchema,
  vehicles_found: Joi.array().items(matchedVehicleInformationSchema).required(),
  excess_vehicles_count: Joi.number().required(),
  total_violations: Joi.number().required()
})

export const ValidateComplianceSnapshotDomainModel = (
  complianceSnapshot: ComplianceSnapshotDomainModel
): ComplianceSnapshotDomainModel => {
  const { error } = ComplianceSnapshotDomainModelSchema.validate(complianceSnapshot)
  if (error) {
    throw new ValidationError(error.message, complianceSnapshot)
  }
  return complianceSnapshot
}
