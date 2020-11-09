export const ENTITY_TYPES = ['event', 'telemetry'] as const
export type ENTITY_TYPE = typeof ENTITY_TYPES[number]

export const DEFAULT_ENTITIES = {'event': ['events:read'], 'telemetry': ['telemetry:read']}
export type SupportedEntities = {
  [e in ENTITY_TYPE]: string[]
}
