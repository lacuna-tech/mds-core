import Joi from 'joi'
import { schemaValidator } from '@mds-core/mds-schema-validators'
import { TransactionDomainModel } from '../@types'

export const { validate: validateTransactionDomainModel, isValid: isValidTransactionDomainModel } = schemaValidator<TransactionDomainModel>(
  Joi.object<TransactionDomainModel>().keys({
    name: Joi.string().required(),
    text: Joi.string().required()
  })
)
