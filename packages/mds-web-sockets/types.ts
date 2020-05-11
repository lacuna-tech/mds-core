export const EntityTypes = ['event', 'telemetry'] as const
export type EntityType = typeof EntityTypes[number]
