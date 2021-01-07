import { DeleteReturning, InsertReturning, ReadWriteRepository, RepositoryError } from '@mds-core/mds-repository'
import { UUID } from '@mds-core/mds-types'
import { In } from 'typeorm'
import { AttachmentDomainToEntityCreate, AttachmentEntityToDomain } from './mappers'
import { AttachmentDomainModel, ReadAttachmentsOptions } from '../@types'
import { AttachmentEntity } from './entities/attachment-entity'

import entities from './entities'
import migrations from './migrations'

class AttachmentReadWriteRepository extends ReadWriteRepository {
  constructor() {
    super('attachments', { entities, migrations })
  }

  public writeAttachment = async (attachment: AttachmentDomainModel): Promise<AttachmentDomainModel> => {
    try {
      const connection = await this.connect('rw')

      const {
        raw: [entity]
      }: InsertReturning<AttachmentEntity> = await connection
        .getRepository(AttachmentEntity)
        .createQueryBuilder()
        .insert()
        .values([AttachmentDomainToEntityCreate.map(attachment)])
        .returning('*')
        .execute()
      return AttachmentEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public deleteAttachment = async (attachment_id: string): Promise<AttachmentDomainModel> => {
    try {
      const connection = await this.connect('rw')

      const {
        raw: [entity]
      }: DeleteReturning<AttachmentEntity> = await connection
        .getRepository(AttachmentEntity)
        .createQueryBuilder()
        .delete()
        .where('attachment_id = :attachment_id', { attachment_id })
        .returning('*')
        .execute()

      return AttachmentEntityToDomain.map(entity)
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public readAttachment = async (attachment_id: string): Promise<AttachmentDomainModel | undefined> => {
    try {
      const connection = await this.connect('rw')

      const entity = await connection.getRepository(AttachmentEntity).findOne({ attachment_id })

      return entity ? AttachmentEntityToDomain.map(entity) : undefined
    } catch (error) {
      throw RepositoryError(error)
    }
  }

  public readAttachments = async (options: ReadAttachmentsOptions): Promise<AttachmentDomainModel[]> => {
    const isAttachmentListIdOption = (opts: ReadAttachmentsOptions): opts is { attachment_list_id: UUID } => 'attachment_list_id' in opts

    const isAttachmentIdsOption = (opts: ReadAttachmentsOptions): opts is { attachment_ids: UUID[] } => {
      if ('attachment_ids' in opts) return true

      return false
    }

    try {
      const connection = await this.connect('rw')

      const attachments = await (async () => {
        if (isAttachmentIdsOption(options)) {
          const { attachment_ids } = options
          return connection.getRepository(AttachmentEntity).find({ attachment_id: In(attachment_ids) })
        }

        if (isAttachmentListIdOption(options)) {
          const { attachment_list_id } = options
          return connection.getRepository(AttachmentEntity).find({ attachment_list_id })
        }

        return []
      })()

      return attachments.map(AttachmentEntityToDomain.mapper())
    } catch (error) {
      throw RepositoryError(error)
    }
  }
}

export const AttachmentRepository = new AttachmentReadWriteRepository()
