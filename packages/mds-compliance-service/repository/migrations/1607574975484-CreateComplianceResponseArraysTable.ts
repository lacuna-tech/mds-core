import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateComplianceArrayResponseTable1607574975484 implements MigrationInterface {
  name = 'CreateComplianceArrayResponseTable1607574975484'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "compliance_array_responses" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" bigint GENERATED ALWAYS AS IDENTITY, "compliance_array_response_id" uuid NOT NULL, "compliance_snapshot_ids"  character varying (255) NOT NULL, "provider_id" uuid  NOT NULL, CONSTRAINT "compliance_array_responses_pkey" PRIMARY KEY ("compliance_array_response_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_recorded_compliance_array_responses" ON "compliance_array_responses" ("recorded") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_recorded_compliance_array_responses"`)
    await queryRunner.query(`DROP TABLE "compliance_array_responses"`)
  }
}
