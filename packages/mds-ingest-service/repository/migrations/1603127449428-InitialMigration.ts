import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1603127449428 implements MigrationInterface {
  name = 'InitialMigration1603127449428'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "telemetry" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" BIGSERIAL NOT NULL, "device_id" uuid NOT NULL, "provider_id" uuid NOT NULL, "timestamp" bigint NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "speed" real, "heading" real, "accuracy" real, "altitude" real, "charge" real, CONSTRAINT "telemetry_pkey" PRIMARY KEY ("device_id", "timestamp"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_telemetry" ON "telemetry" ("recorded") `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_telemetry" ON "telemetry" ("id") `)
    await queryRunner.query(
      `CREATE TABLE "devices" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" BIGSERIAL NOT NULL, "device_id" uuid NOT NULL, "provider_id" uuid NOT NULL, "vehicle_id" character varying(255) NOT NULL, "type" character varying(31) NOT NULL, "propulsion" character varying(31) array NOT NULL, "year" smallint, "mfgr" character varying(127), "model" character varying(127), CONSTRAINT "devices_pkey" PRIMARY KEY ("device_id"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_devices" ON "devices" ("recorded") `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_devices" ON "devices" ("id") `)
    await queryRunner.query(
      `CREATE TABLE "events" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" BIGSERIAL NOT NULL, "device_id" uuid NOT NULL, "provider_id" uuid NOT NULL, "timestamp" bigint NOT NULL, "event_type" character varying(31) NOT NULL, "event_type_reason" character varying(31), "telemetry_timestamp" bigint, "trip_id" uuid, "service_area_id" uuid, CONSTRAINT "events_pkey" PRIMARY KEY ("device_id", "timestamp"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_events" ON "events" ("recorded") `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_events" ON "events" ("id") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_id_events"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_events"`)
    await queryRunner.query(`DROP TABLE "events"`)
    await queryRunner.query(`DROP INDEX "idx_id_devices"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_devices"`)
    await queryRunner.query(`DROP TABLE "devices"`)
    await queryRunner.query(`DROP INDEX "idx_id_telemetry"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_telemetry"`)
    await queryRunner.query(`DROP TABLE "telemetry"`)
  }
}
