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

const getNextStates = (currStatus: VEHICLE_STATE, nextEvent: VEHICLE_EVENT): Array<VEHICLE_STATE> | undefined => {
  return stateTransitionDict[currStatus]?.[nextEvent]
}

function isEventSequenceValidHelper(eventTypeA: VEHICLE_EVENT, eventTypeB: VEHICLE_EVENT) {
  const currStates = EVENT_STATES_MAP[eventTypeA]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const currState of currStates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // See if it's possible to transition to any states using eventB's event_type
    const nextStates: any = getNextStates(currState, eventTypeB)
    if (nextStates) {
      return true
    }
  }
  return false
}

function isEventSequenceValid(eventA: VehicleEvent, eventB: VehicleEvent) {
  for (const eventTypeA of eventA.event_types) {
    for (const eventTypeB of eventB.event_types) {
      if (isEventSequenceValidHelper(eventTypeA, eventTypeB)) {
        return true
      }
    }
  }
  return false
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

export { isEventSequenceValid, stateTransitionDict, getNextStates, generateGraph }
