import {
  VEHICLE_STATES,
  VEHICLE_EVENTS,
  VEHICLE_STATE,
  VEHICLE_EVENT,
  EVENT_STATES_MAP,
  VehicleEvent
} from '@mds-core/mds-types'

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
  [VEHICLE_STATES.available]: {
    [VEHICLE_EVENTS.agency_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.battery_low]: [VEHICLE_STATES.non_operational],
    [VEHICLE_EVENTS.comms_lost]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.compliance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.decommissioned]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.maintenance]: [VEHICLE_STATES.non_operational],
    [VEHICLE_EVENTS.maintenance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.missing]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.off_hours]: [VEHICLE_STATES.non_operational],
    [VEHICLE_EVENTS.rebalance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.reservation_start]: [VEHICLE_STATES.reserved],
    [VEHICLE_EVENTS.system_suspend]: [VEHICLE_STATES.non_operational],
    [VEHICLE_EVENTS.trip_start]: [VEHICLE_STATES.on_trip],
    [VEHICLE_EVENTS.unspecified]: [VEHICLE_STATES.non_operational, VEHICLE_STATES.unknown, VEHICLE_STATES.removed]
  },
  [VEHICLE_STATES.elsewhere]: {
    [VEHICLE_EVENTS.agency_drop_off]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.agency_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.comms_lost]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.compliance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.decommissioned]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.maintenance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.missing]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.provider_drop_off]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.rebalance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.trip_enter_jurisdiction]: [VEHICLE_STATES.on_trip],
    [VEHICLE_EVENTS.unspecified]: [VEHICLE_STATES.available, VEHICLE_STATES.removed]
  },
  [VEHICLE_STATES.non_operational]: {
    [VEHICLE_EVENTS.agency_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.battery_charged]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.comms_lost]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.compliance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.decommissioned]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.maintenance]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.maintenance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.missing]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.on_hours]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.rebalance_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.system_resume]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.unspecified]: [VEHICLE_STATES.available, VEHICLE_STATES.removed]
  },
  [VEHICLE_STATES.on_trip]: {
    [VEHICLE_EVENTS.comms_lost]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.trip_cancel]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.trip_end]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.trip_leave_jurisdiction]: [VEHICLE_STATES.elsewhere],
    [VEHICLE_EVENTS.missing]: [VEHICLE_STATES.unknown]
  },
  [VEHICLE_STATES.removed]: {
    [VEHICLE_EVENTS.agency_drop_off]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.decommissioned]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.provider_drop_off]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.unspecified]: [VEHICLE_STATES.available]
  },
  [VEHICLE_STATES.reserved]: {
    [VEHICLE_EVENTS.comms_lost]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.missing]: [VEHICLE_STATES.unknown],
    [VEHICLE_EVENTS.reservation_cancel]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.trip_start]: [VEHICLE_STATES.on_trip],
    [VEHICLE_EVENTS.unspecified]: [VEHICLE_STATES.available]
  },
  [VEHICLE_STATES.unknown]: {
    [VEHICLE_EVENTS.agency_drop_off]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.agency_pick_up]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.comms_restored]: [
      VEHICLE_STATES.available,
      VEHICLE_STATES.elsewhere,
      VEHICLE_STATES.reserved,
      VEHICLE_STATES.on_trip,
      VEHICLE_STATES.non_operational
    ],
    [VEHICLE_EVENTS.decommissioned]: [VEHICLE_STATES.removed],
    [VEHICLE_EVENTS.provider_drop_off]: [VEHICLE_STATES.available],
    [VEHICLE_EVENTS.unspecified]: [VEHICLE_STATES.available, VEHICLE_STATES.removed]
  }
}

const getNextStates = (currStatus: VEHICLE_STATE, nextEvent: VEHICLE_EVENT): VEHICLE_STATE[] | undefined => {
  return stateTransitionDict[currStatus]?.[nextEvent]
}

// Filter for all states that have this event as a valid exiting event
function getValidExitableStates(states: VEHICLE_STATE[], event: VEHICLE_EVENT) {
  return states.reduce((acc: VEHICLE_STATE[], state) => {
    if (Object.keys(stateTransitionDict[state]).includes(event)) {
      acc.push(state)
    }
    return acc
  }, [])
}

function isEventValid(event: VehicleEvent) {
  const { event_types } = event
  const finalEventType: VEHICLE_EVENT = event_types[event_types.length - 1]
  return !!EVENT_STATES_MAP[finalEventType].includes(event.vehicle_state as VEHICLE_STATE)
}

function isEventSequenceValid(eventA: VehicleEvent, eventB: VehicleEvent) {
  let prevStates: VEHICLE_STATE[] = [eventA.vehicle_state]
  for (const eventTypeB of eventB.event_types) {
    const validExitStates = getValidExitableStates(prevStates, eventTypeB)
    if (validExitStates.length > 0) {
      let arr: VEHICLE_STATE[] = []
      validExitStates.map(nextState => {
        const possibleNextStates = getNextStates(nextState, eventTypeB)
        if (possibleNextStates) {
          arr = arr.concat(possibleNextStates)
        }
      })
      const nextStates = arr
      if (nextStates) {
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
  const statuses: VEHICLE_STATE[] = Object.values(VEHICLE_STATES)
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

export { getValidExitableStates, isEventValid, isEventSequenceValid, stateTransitionDict, getNextStates, generateGraph }
