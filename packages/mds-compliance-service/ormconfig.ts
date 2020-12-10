import { ComplianceRepository } from './repository'

// Make connection options available to TypeORM CLI
module.exports = ComplianceRepository.cli({ migrationsDir: 'repository/migrations' })
