import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTransactionTables1607356036132 implements MigrationInterface {
  name = 'CreateTransactionTables1607356036132'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_id" uuid NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")`
    )
    await queryRunner.query(`ALTER TABLE "transactions" ADD "provider_id" uuid NOT NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "device_id" uuid`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "timestamp" bigint NOT NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "fee_type" character varying(127) NOT NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "amount" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "receipt" jsonb NOT NULL`)
    await queryRunner.query(`COMMENT ON COLUMN "transactions"."recorded" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "recorded" SET DEFAULT (extract(epoch from now()) * 1000)::bigint`
    )
    await queryRunner.query(`COMMENT ON COLUMN "transactions"."id" IS NULL`)
    await queryRunner.query(`CREATE SEQUENCE "transactions_id_seq" OWNED BY "transactions"."id"`)
    await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "id" SET DEFAULT nextval('transactions_id_seq')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "id" DROP DEFAULT`)
    await queryRunner.query(`DROP SEQUENCE "transactions_id_seq"`)
    await queryRunner.query(`COMMENT ON COLUMN "transactions"."id" IS NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "recorded" SET DEFAULT ((date_part('epoch'`)
    await queryRunner.query(`COMMENT ON COLUMN "transactions"."recorded" IS NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "receipt"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "fee_type"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "timestamp"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "device_id"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "provider_id"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey"`)
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_id"`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "text" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD "name" character varying(255) NOT NULL`)
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("name")`)
  }
}
