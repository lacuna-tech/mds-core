import { QueryRunner } from 'typeorm'

const selectTableNameFromSchema = (name: string) =>
  `SELECT "table_name" FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = '${name}'`

export const MigrationHelper = (queryRunner: QueryRunner) => ({
  tableExists: async (name: string) => {
    const [table_name] = await queryRunner.query(selectTableNameFromSchema(name))
    return table_name === name
  },
  tableNotExists: async (name: string) => {
    const [table_name] = await queryRunner.query(selectTableNameFromSchema(name))
    return table_name === undefined
  }
})
