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
  /** A way to link attachments together, intended to serve as a foreign key to the original owner.
   * E.g, if an audit has multiple attachments uploaded for it, the `attachment_list_id` for
   * each of them would be the `audit_trip_id` so they could easily be searched for. */
  attachment_list_id: Nullable<UUID>
}

export type AttachmentDomainCreateModel = DomainModelCreate<AttachmentDomainModel>

export interface AttachmentService {
  name: () => string
}

export const AttachmentServiceDefinition: RpcServiceDefinition<AttachmentService> = {
  name: RpcRoute<AttachmentService['name']>()
}
