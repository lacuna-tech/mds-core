import { ServiceProvider, ProcessController, ServiceResult } from '@mds-core/mds-service-helpers'
import { AttachmentService } from '../@types'
import { AttachmentRepository } from '../repository'
import { writeAttachment, deleteAttachment } from './helpers'

export const AttachmentServiceProvider: ServiceProvider<AttachmentService> & ProcessController = {
  start: AttachmentRepository.initialize,
  stop: AttachmentRepository.shutdown,
  writeAttachment,
  deleteAttachment,
  name: async () => ServiceResult('mds-attachment-service')
}
