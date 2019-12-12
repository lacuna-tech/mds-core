export const ENTITY_TYPES = ['EVENTS', 'TELEMETRIES'] as const
export type ENTITY = typeof ENTITY_TYPES[number]