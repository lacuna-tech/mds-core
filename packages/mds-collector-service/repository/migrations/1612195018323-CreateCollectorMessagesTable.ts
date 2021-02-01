import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCollectorMessagesTable1612195018323 implements MigrationInterface {
  name = 'CreateCollectorMessagesTable1612195018323'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "collector-messages" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" bigint GENERATED ALWAYS AS IDENTITY, "schema" character varying(255) NOT NULL, "message" json NOT NULL, CONSTRAINT "collector_messages_pkey" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_collector_messages" ON "collector-messages" ("recorded") `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_collector_messages" ON "collector-messages" ("id") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_id_collector_messages"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_collector_messages"`)
    await queryRunner.query(`DROP TABLE "collector-messages"`)
  }
}
