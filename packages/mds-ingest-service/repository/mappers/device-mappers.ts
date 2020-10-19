import { Timestamp } from '@mds-core/mds-types'
import { IdentityColumn, ModelMapper } from '@mds-core/mds-repository'
import { DeviceEntityModel } from '../entities/device-entity'
import { DeviceDomainCreateModel, DeviceDomainModel } from '../../@types'

type DeviceEntityToDomainOptions = Partial<{}>

export const DeviceEntityToDomain = ModelMapper<DeviceEntityModel, DeviceDomainModel, DeviceEntityToDomainOptions>(
  (entity, options) => {
    const { id, ...domain } = entity
    return { ...domain }
  }
)

type DeviceEntityCreateOptions = Partial<{
  recorded: Timestamp
}>

export type DeviceEntityCreateModel = Omit<DeviceEntityModel, keyof IdentityColumn>

export const DeviceDomainToEntityCreate = ModelMapper<
  DeviceDomainCreateModel,
  DeviceEntityCreateModel,
  DeviceEntityCreateOptions
>(({ year = null, mfgr = null, model = null, ...domain }, options) => {
  return { year, mfgr, model, ...domain }
})
