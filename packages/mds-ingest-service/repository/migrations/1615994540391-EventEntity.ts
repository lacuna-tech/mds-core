import { MigrationInterface, QueryRunner } from 'typeorm'

export class EventEntity1615994540391 implements MigrationInterface {
  name = 'EventEntity1615994540391'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_trip_id_events" ON "events" ("trip_id") `)
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_timestamp_events" ON "events" ("timestamp") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_trip_id_events"`)
    await queryRunner.query(`DROP INDEX "idx_timestamp_events"`)
  }
}
