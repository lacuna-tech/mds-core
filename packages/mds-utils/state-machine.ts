import { VEHICLE_STATES, VEHICLE_STATE, VEHICLE_EVENT, EVENT_STATES_MAP, VehicleEvent } from '@mds-core/mds-types'

/* Start with a state, then there's a list of valid event_types by which one
 * may transition out, then possible states for each event_type
 */
const stateTransitionDict: {
  [S in VEHICLE_STATE]: Partial<
    {
      [E in VEHICLE_EVENT]: VEHICLE_STATE[]
    }
  >
} = {
  available: {
    agency_pick_up: ['removed'],
    battery_low: ['non_operational'],
    comms_lost: ['unknown'],
    compliance_pick_up: ['removed'],
    decommissioned: ['removed'],
    maintenance: ['non_operational'],
    maintenance_pick_up: ['removed'],
    missing: ['unknown'],
    off_hours: ['non_operational'],
    rebalance_pick_up: ['removed'],
    reservation_start: ['reserved'],
    system_suspend: ['non_operational'],
    trip_start: ['on_trip'],
    unspecified: ['non_operational', 'unknown', 'removed']
  },
  elsewhere: {
    agency_drop_off: ['available'],
    agency_pick_up: ['removed'],
    comms_lost: ['unknown'],
    compliance_pick_up: ['removed'],
    decommissioned: ['removed'],
    maintenance_pick_up: ['removed'],
    missing: ['unknown'],
    provider_drop_off: ['available'],
    rebalance_pick_up: ['removed'],
    trip_enter_jurisdiction: ['on_trip'],
    unspecified: ['available', 'removed']
  },
  non_operational: {
    agency_pick_up: ['removed'],
    battery_charged: ['available'],
    comms_lost: ['unknown'],
    compliance_pick_up: ['removed'],
    decommissioned: ['removed'],
    maintenance: ['available'],
    maintenance_pick_up: ['removed'],
    missing: ['unknown'],
    on_hours: ['available'],
    rebalance_pick_up: ['removed'],
    system_resume: ['available'],
    unspecified: ['available', 'removed']
  },
  on_trip: {
    comms_lost: ['unknown'],
    trip_cancel: ['available'],
    trip_end: ['available'],
    trip_leave_jurisdiction: ['elsewhere'],
    missing: ['unknown']
  },
  removed: {
    agency_drop_off: ['available'],
    decommissioned: ['removed'],
    provider_drop_off: ['available'],
    unspecified: ['available']
  },
  reserved: {
    comms_lost: ['unknown'],
    missing: ['unknown'],
    reservation_cancel: ['available'],
    trip_start: ['on_trip'],
    unspecified: ['available']
  },
  unknown: {
    agency_drop_off: ['available'],
    agency_pick_up: ['removed'],
    comms_restored: ['available', 'elsewhere', 'reserved', 'on_trip', 'non_operational'],
    decommissioned: ['removed'],
    provider_drop_off: ['available'],
    unspecified: ['available', 'removed']
  }
}

const getNextStates = (currStatus: VEHICLE_STATE, nextEvent: VEHICLE_EVENT): VEHICLE_STATE[] | undefined => {
  return stateTransitionDict[currStatus]?.[nextEvent]
}

// Filter for all states that have this event as a valid exiting event
function getValidPreviousStates(event: VEHICLE_EVENT, states: Readonly<VEHICLE_STATE[]> = VEHICLE_STATES) {
  return states.filter(state => {
    return Object.keys(stateTransitionDict[state]).includes(event)
  })
}

function isEventValid(event: VehicleEvent) {
  const { event_types } = event
  const finalEventType: VEHICLE_EVENT = event_types[event_types.length - 1]
  return EVENT_STATES_MAP[finalEventType].includes(event.vehicle_state as VEHICLE_STATE)
}

function isEventSequenceValid(eventA: VehicleEvent, eventB: VehicleEvent) {
  let prevStates: VEHICLE_STATE[] = [eventA.vehicle_state]
  for (const eventTypeB of eventB.event_types) {
    const validPreviousStates = getValidPreviousStates(eventTypeB, prevStates)
    if (validPreviousStates.length > 0) {
      const nextStates = validPreviousStates.reduce((acc: VEHICLE_STATE[], state) => {
        const possibleNextStates = getNextStates(state, eventTypeB)
        if (possibleNextStates) {
          return [...acc, ...possibleNextStates]
        }
        return acc
      }, [])
      if (nextStates.length > 0) {
        prevStates = nextStates
      } else {
        return false
      }
    } else {
      return false
    }
  }
  return prevStates.includes(eventB.vehicle_state)
}

const generateTransitionLabel = (status: VEHICLE_STATE, nextStatus: VEHICLE_STATE, transitionEvent: VEHICLE_EVENT) => {
  return `${status} -> ${nextStatus} [ label = ${transitionEvent} ]`
}

// Punch this output into http://www.webgraphviz.com/
const generateGraph = () => {
  const graphEntries = []
  const statuses: Readonly<VEHICLE_STATE[]> = VEHICLE_STATES
  for (const status of statuses) {
    const eventTransitions: VEHICLE_EVENT[] = Object.keys(stateTransitionDict[status]) as VEHICLE_EVENT[]
    for (const event of eventTransitions) {
      if (event) {
        const nextStatuses: Array<VEHICLE_STATE> | undefined = stateTransitionDict[status][event]
        if (nextStatuses) {
          for (const nextStatus of nextStatuses) {
            graphEntries.push(`\t${generateTransitionLabel(status, nextStatus, event)}`)
          }
        }
      }
    }
  }
  return `digraph G {\n${graphEntries.join('\n')}\n}`
}

export { getValidPreviousStates, isEventValid, isEventSequenceValid, stateTransitionDict, getNextStates, generateGraph }
