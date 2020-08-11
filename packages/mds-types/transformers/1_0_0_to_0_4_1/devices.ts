import { Device_v1_0_0 } from '../../index'
import { Device_v0_4_1 } from '../@types'

export function convert_v1_0_0_device_to_0_4_1(device: Device_v1_0_0): Device_v0_4_1 {
  const {
    provider_id,
    device_id,
    vehicle_id,
    vehicle_type,
    propulsion_types,
    year,
    mfgr,
    model,
    recorded,
    state
  } = device
  return {
    provider_id,
    device_id,
    vehicle_id,
    type: vehicle_type,
    propulsion: propulsion_types[0], // Not ideal, but backconversion can be lossy
    year,
    mfgr,
    model,
    recorded,
    status: state
  }
}
