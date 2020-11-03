import { QueryRunner } from 'typeorm'

const selectTableNameFromSchema = (name: string) =>
  `SELECT "table_name" FROM information_schema.tables WHERE "table_catalog" = CURRENT_CATALOG AND "table_schema" = CURRENT_SCHEMA AND "table_name" = '${name}'`

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
