import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateJurisdictionsTable1582294819607 implements MigrationInterface {
  name = 'CreateJurisdictionsTable1582294819607'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "jurisdictions" ("id" bigint GENERATED ALWAYS AS IDENTITY, "recorded" bigint NOT NULL, "jurisdiction_id" uuid NOT NULL, "agency_key" character varying(63) NOT NULL, "versions" json NOT NULL, CONSTRAINT "jurisdictions_pkey" PRIMARY KEY ("jurisdiction_id"))`,
      undefined
    )
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_jurisdictions" ON "jurisdictions" ("id") `, undefined)
    await queryRunner.query(`CREATE INDEX "idx_recorded_jurisdictions" ON "jurisdictions" ("recorded") `, undefined)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_agency_key_jurisdictions" ON "jurisdictions" ("agency_key") `,
      undefined
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_agency_key_jurisdictions"`, undefined)
    await queryRunner.query(`DROP INDEX "idx_recorded_jurisdictions"`, undefined)
    await queryRunner.query(`DROP INDEX "idx_id_jurisdictions"`, undefined)
    await queryRunner.query(`DROP TABLE "jurisdictions"`, undefined)
  }
}
