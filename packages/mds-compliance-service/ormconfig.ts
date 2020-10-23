import { ComplianceSnapshotRepository } from './repository'

// Make connection options available to TypeORM CLI
module.exports = ComplianceSnapshotRepository.cli({ migrationsDir: 'repository/migrations' })
