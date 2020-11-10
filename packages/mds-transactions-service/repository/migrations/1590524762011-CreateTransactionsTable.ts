import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTransactionsTable1590524762011 implements MigrationInterface {
  name = 'CreateTransactionsTable1590524762011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transactions" ("recorded" bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint, "id" bigint GENERATED ALWAYS AS IDENTITY, "name" character varying(255) NOT NULL, "text" character varying NOT NULL, CONSTRAINT "transactions_pkey" PRIMARY KEY ("name"))`
    )
    await queryRunner.query(`CREATE INDEX "idx_recorded_transactions" ON "transactions" ("recorded") `)
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_id_transactions" ON "transactions" ("id") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_id_transactions"`)
    await queryRunner.query(`DROP INDEX "idx_recorded_transactions"`)
    await queryRunner.query(`DROP TABLE "transactions"`)
  }
}
