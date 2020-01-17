import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { UUID } from '@mds-core/mds-types'
import { FeatureCollection } from 'geojson'
import { IdentityEntity, IdentityModel } from './identity-entity'
// [TABLE.policies]: [COLUMN.id, COLUMN.policy_id, COLUMN.policy_json],

//  [COLUMN.policy_id]: 'uuid NOT NULL',
//   [COLUMN.policy_json]: 'json NOT NULL',

export interface PolicyModel extends IdentityModel {
  id: number
  policy_id: UUID
  policy_json: FeatureCollection
}
@Entity('policies')
export class PolicyEntity extends IdentityEntity implements PolicyModel {
  @Column('uuid', { primary: true })
  policy_id: UUID

  @Column('json')
  policy_json: FeatureCollection
}
