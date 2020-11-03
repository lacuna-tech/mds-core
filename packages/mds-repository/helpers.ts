import { QueryRunner } from 'typeorm'

const selectTableNameFromSchema = (name: string) =>
  `SELECT COUNT(*) FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = '${name}'`

export const MigrationHelper = (queryRunner: QueryRunner) => ({
  tableExists: async (name: string) => {
    const [{ count }]: [{ count: number }] = await queryRunner.query(selectTableNameFromSchema(name))
    return count !== 0
  },
  tableNotExists: async (name: string) => {
    const [{ count }]: [{ count: number }] = await queryRunner.query(selectTableNameFromSchema(name))
    return count === 0
  }
})
