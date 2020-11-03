import { MigrationInterface, QueryRunner } from 'typeorm'
import { MigrationHelper } from '@mds-core/mds-repository'

export class CreateAuditAttachmentsTable1603247961047 implements MigrationInterface {
  name = 'CreateAuditAttachmentsTable1603247961047'

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await MigrationHelper(queryRunner).tableNotExists('audit_attachments')) {
      await queryRunner.query(
        `CREATE TABLE "audit_attachments" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" bigint GENERATED ALWAYS AS IDENTITY, "audit_trip_id" uuid NOT NULL, "attachment_id" uuid NOT NULL, CONSTRAINT "audit_attachments_pkey" PRIMARY KEY ("audit_trip_id", "attachment_id"))`
      )
      await queryRunner.query(`CREATE INDEX "idx_recorded_audit_attachments" ON "audit_attachments" ("recorded") `)
      await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_audit_attachments" ON "audit_attachments" ("id") `)
    } else {
      await queryRunner.query(
        `ALTER TABLE "audit_attachments" ALTER COLUMN "recorded" SET DEFAULT (extract(epoch from now()) * 1000)::bigint`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_id_audit_attachments"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_audit_attachments"`)
    await queryRunner.query(`DROP TABLE "audit_attachments"`)
  }
}
