import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateComplianceSnapshotsTable1590524762011 implements MigrationInterface {
  name = 'CreateComplianceSnapshotsTable1590524762011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ComplianceSnapshots" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" bigint GENERATED ALWAYS AS IDENTITY, "name" character varying(255) NOT NULL, "text" character varying NOT NULL, CONSTRAINT "ComplianceSnapshots_pkey" PRIMARY KEY ("name"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_ComplianceSnapshots" ON "ComplianceSnapshots" ("recorded") `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_ComplianceSnapshots" ON "ComplianceSnapshots" ("id") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_id_ComplianceSnapshots"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_ComplianceSnapshots"`)
    await queryRunner.query(`DROP TABLE "ComplianceSnapshots"`)
  }
}
