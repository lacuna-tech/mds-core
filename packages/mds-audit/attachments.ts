/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import db from '@mds-core/mds-db'
import logger from '@mds-core/mds-logger'
import aws from 'aws-sdk'
import { Attachment, AttachmentSummary, AuditAttachment, Recorded, UUID } from '@mds-core/mds-types'
import { AttachmentServiceClient } from '@mds-core/mds-attachment-service'

/* eslint-disable-next-line */
const multer = require('multer')
const { env } = process
const s3Region = String(env.ATTACHMENTS_REGION)
const memoryStorage = multer.memoryStorage()

if (env.ATTACHMENTS_BUCKET) {
  /* eslint-disable-next-line */
  aws.config.getCredentials(async err => {
    if (err) {
      logger.error('Error getting AWS credentials', err.stack || err)
    } else if (aws.config.credentials) {
      aws.config.update({
        secretAccessKey: aws.config.credentials.secretAccessKey,
        accessKeyId: aws.config.credentials.accessKeyId,
        region: s3Region
      })
    }
  })
}

export const multipartFormUpload = multer({ storage: memoryStorage }).single('file')

export function attachmentSummary(attachment: Attachment): AttachmentSummary {
  const thumbnailUrl = attachment.thumbnail_filename ? attachment.base_url + attachment.thumbnail_filename : ''
  return {
    attachment_id: attachment.attachment_id,
    attachment_url: attachment.base_url + attachment.attachment_filename,
    thumbnail_url: thumbnailUrl
  }
}

export async function writeAttachment(file: Express.Multer.File, auditTripId: UUID) {
  const attachment = await AttachmentServiceClient.writeAttachment(
    file as Express.Multer.File & { buffer: { type: 'Buffer'; data: [] } }
  )
  await db.writeAuditAttachment({
    attachment_id: attachment.attachment_id,
    audit_trip_id: auditTripId
  } as AuditAttachment)
  return attachment
}

export async function readAttachments(audit_trip_id: UUID): Promise<Recorded<Attachment>[]> {
  const result: Recorded<Attachment>[] = await db.readAttachmentsForAudit(audit_trip_id)
  return result
}

export async function deleteAuditAttachment(auditTripId: UUID, attachmentId: UUID) {
  try {
    await db.deleteAuditAttachment(auditTripId, attachmentId)
    // Delete the attachment if it is not used by any other audits
    const auditAttachments = await db.readAuditAttachments(attachmentId)
    if (auditAttachments.length === 0) {
      await AttachmentServiceClient.deleteAttachment(attachmentId)
    }
  } catch (err) {
    logger.error('deleteAttachment error', err.stack || err)
    throw err
  }
}
