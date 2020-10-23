import { Entity, Column } from 'typeorm'
import { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceSnapshotDomainModel } from '../../@types'

export interface ComplianceSnapshotEntityModel extends IdentityColumn, RecordedColumn {
  name: ComplianceSnapshotDomainModel['name']
  text: ComplianceSnapshotDomainModel['text']
}

@Entity('ComplianceSnapshots')
export class ComplianceSnapshotEntity extends IdentityColumn(RecordedColumn(class {})) implements ComplianceSnapshotEntityModel {
  @Column('varchar', { primary: true, length: 255 })
  name: ComplianceSnapshotEntityModel['name']

  @Column('varchar')
  text: ComplianceSnapshotEntityModel['text']
}
