import { ConfigManager } from '@mds-core/mds-config-service'

interface TripProcessorConfig {
  compliance_sla: {
    max_telemetry_time: number
    max_telemetry_distance: number
  }
}

const manager = ConfigManager<TripProcessorConfig>(['compliance_sla'])

export const getConfig = async () => manager.getConfig()
