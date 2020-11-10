import { Entity, Column } from 'typeorm'
import { IdentityColumn, RecordedColumn } from '@mds-core/mds-repository'
import { TransactionDomainModel } from '../../@types'

export interface TransactionEntityModel extends IdentityColumn, RecordedColumn {
  name: TransactionDomainModel['name']
  text: TransactionDomainModel['text']
}

@Entity('transactions')
export class TransactionEntity extends IdentityColumn(RecordedColumn(class {})) implements TransactionEntityModel {
  @Column('varchar', { primary: true, length: 255 })
  name: TransactionEntityModel['name']

  @Column('varchar')
  text: TransactionEntityModel['text']
}
