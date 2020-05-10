export const ENTITY_TYPES = ['EVENTS', 'TELEMETRIES'] as const
export type ENTITY_TYPE = typeof ENTITY_TYPES[number]

export type WS_EVENT_TOPIC = 'event' | 'telemetry'

export type EventEntityMap = {
  [S in WS_EVENT_TOPIC]: ENTITY_TYPE
}
