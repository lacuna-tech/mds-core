import { Entity, Column } from 'typeorm'
import { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { ComplianceArrayResponseDomainModel } from '../../@types'

export interface ComplianceArrayResponseEntityModel extends IdentityColumn, RecordedColumn {
  compliance_array_response_id: ComplianceArrayResponseDomainModel['compliance_array_response_id']
  compliance_snapshot_ids: string
  provider_id: ComplianceArrayResponseDomainModel['provider_id']
}

@Entity('compliance_array_responses')
export class ComplianceArrayResponseEntity
  extends IdentityColumn(RecordedColumn(class {}))
  implements ComplianceArrayResponseEntityModel {
  @Column('uuid', { primary: true })
  compliance_array_response_id: ComplianceArrayResponseEntityModel['compliance_array_response_id']

  @Column('varchar', { length: 255 })
  compliance_snapshot_ids: string

  @Column('uuid')
  provider_id: ComplianceArrayResponseEntityModel['provider_id']
}
