import { VehicleEvent, Telemetry, Device } from '@mds-core/mds-types'

export interface Stream {
  writeEvent: (event: VehicleEvent) => Promise<void>
  writeTelemetry: (telemetry: Telemetry[]) => Promise<void>
  writeDevice: (device: Device) => Promise<void>
  shutdown: () => void
}
