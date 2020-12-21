import { DomainModelCreate } from '@mds-core/mds-repository'
import { RpcServiceDefinition, RpcRoute } from '@mds-core/mds-rpc-common'
import { Nullable, UUID } from '@mds-core/mds-types'

export interface AttachmentDomainModel {
  attachment_id: UUID
  attachment_filename: string
  base_url: string
  mimetype: string
  thumbnail_filename: Nullable<string>
  thumbnail_mimetype: Nullable<string>
}

export type AttachmentDomainCreateModel = DomainModelCreate<AttachmentDomainModel>

export type RpcFile = Express.Multer.File & { buffer: { type: 'Buffer'; data: [] } }

export interface AttachmentService {
  deleteAttachment: (attachment_id: UUID) => AttachmentDomainModel
  name: () => string
  writeAttachment: (file: RpcFile) => AttachmentDomainModel
}

export const AttachmentServiceDefinition: RpcServiceDefinition<AttachmentService> = {
  deleteAttachment: RpcRoute<AttachmentService['deleteAttachment']>(),
  name: RpcRoute<AttachmentService['name']>(),
  writeAttachment: RpcRoute<AttachmentService['writeAttachment']>()
}
