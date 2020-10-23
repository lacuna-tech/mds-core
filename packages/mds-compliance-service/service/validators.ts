import Joi from 'joi'
import { ValidationError } from '@mds-core/mds-utils'
import { ComplianceSnapshotDomainModel } from '../@types'

export const ComplianceSnapshotDomainModelSchema = Joi.object().keys({
  name: Joi.string().required().error(Error('name is missing')),
  text: Joi.string().required().error(Error('text is missing'))
})

export const ValidateComplianceSnapshotDomainModel = (ComplianceSnapshot: ComplianceSnapshotDomainModel): ComplianceSnapshotDomainModel => {
  const { error } = ComplianceSnapshotDomainModelSchema.validate(ComplianceSnapshot)
  if (error) {
    throw new ValidationError(error.message, ComplianceSnapshot)
  }
  return ComplianceSnapshot
}
