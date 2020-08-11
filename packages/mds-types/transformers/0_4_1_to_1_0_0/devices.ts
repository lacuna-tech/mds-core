import { Device_v1_0_0 } from '../../index'
import { Device_v0_4_1 } from '../@types'

export function convert_v0_4_1_device_to_1_0_0(device: Device_v0_4_1): Device_v1_0_0 {
  const { provider_id, device_id, vehicle_id, type, propulsion, year, mfgr, model, recorded, status } = device
  return {
    provider_id,
    device_id,
    vehicle_id,
    vehicle_type: type,
    propulsion_types: [propulsion],
    year,
    mfgr,
    model,
    recorded,
    state: status
  }
}
