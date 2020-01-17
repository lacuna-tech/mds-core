import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { IdentityEntity } from './identity-entity'
import { UUID } from '@mds-core/mds-types'
import { FeatureCollection } from 'geojson'
// [TABLE.policies]: [COLUMN.id, COLUMN.policy_id, COLUMN.policy_json],

//  [COLUMN.policy_id]: 'uuid NOT NULL',
//   [COLUMN.policy_json]: 'json NOT NULL',
@Entity('policies')
export class PolicyEntity extends IdentityEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('uuid', { primary: true })
  policy_id: UUID

  @Column('json')
  policy_json: FeatureCollection
}
