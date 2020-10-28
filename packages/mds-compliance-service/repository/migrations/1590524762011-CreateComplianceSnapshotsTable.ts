import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateComplianceSnapshotsTable1590524762011 implements MigrationInterface {
  name = 'CreateComplianceSnapshotsTable1590524762011'

  /*

export interface ComplianceSnapshotDomainModel {
  compliance_as_of: Timestamp
  compliance_snapshot_id: UUID
  policy: {
    name: string
    policy_id: UUID
  }
  provider_id: UUID
  vehicles_found: MatchedVehicleInformation[]
  excess_vehicles_count: number
  total_violations: number
}
*/
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "compliance_snapshots" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" bigint GENERATED ALWAYS AS IDENTITY, "compliance_as_of" bigint NOT NULL, "compliance_snapshot_id" uuid NOT NULL, "policy_name" character varying (255) NOT NULL, "policy_id" uuid NOT NULL,"provider_id" uuid NOT NULL, "vehicles_found" jsonb NOT NULL, "excess_vehicles_count" integer NOT NULL, "total_violations" integer NOT NULL, CONSTRAINT "compliance_snapshots_pkey" PRIMARY KEY ("compliance_snapshot_id"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_compliance_snapshots" ON "compliance_snapshots" ("recorded") `)
    await queryRunner.query(
      `CREATE INDEX "idx_compliance_as_of_compliance_snapshots" ON "compliance_snapshots" ("compliance_as_of") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_provider_id_compliance_snapshots" ON "compliance_snapshots" ("provider_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_policy_id_compliance_snapshots" ON "compliance_snapshots" ("policy_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_recorded_compliance_snapshots"`)
    await queryRunner.query(`DROP INDEX "idx_compliance_as_of_compliance_snapshots"`)
    await queryRunner.query(`DROP INDEX "idx_provider_id_compliance_snapshots"`)
    await queryRunner.query(`DROP INDEX "idx_policy_id_compliance_snapshots"`)
    await queryRunner.query(`DROP TABLE "compliance_snapshots"`)
  }
}
