import { Column, Index } from 'typeorm'
import { BigintTransformer } from '../transformers'

export interface IdentityEntityModel {
  id: number
}

export abstract class IdentityEntity implements IdentityEntityModel {
  @Column('bigint', { generated: 'increment', transformer: BigintTransformer })
  @Index({ unique: true })
  id: number
}
