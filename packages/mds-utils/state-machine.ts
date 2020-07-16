import { VEHICLE_STATES, VEHICLE_EVENTS, VEHICLE_STATE, VEHICLE_EVENT } from '@mds-core/mds-types'

const stateTransitionDict: {
  [S in VEHICLE_STATE]: Partial<
    {
      [E in VEHICLE_EVENT]: Array<VEHICLE_STATE>
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

const getNextState = (currStatus: VEHICLE_STATE, nextEvent: VEHICLE_EVENT): Array<VEHICLE_STATE> | undefined => {
  return stateTransitionDict[currStatus]?.[nextEvent]
}

const generateTransitionLabel = (
  status: VEHICLE_STATE,
  nextStatus: Array<VEHICLE_STATE>,
  transitionEvent: VEHICLE_EVENT
) => {
  return `${status} -> ${nextStatus.join(', ')} [ label = ${transitionEvent} ]`
}

// Punch this output into http://www.webgraphviz.com/
const generateGraph = () => {
  const graphEntries = []
  const statuses: VEHICLE_STATE[] = Object.values(VEHICLE_STATES)
  for (const status of statuses) {
    const eventTransitions: VEHICLE_EVENT[] = Object.keys(stateTransitionDict[status]) as VEHICLE_EVENT[]
    for (const event of eventTransitions) {
      if (event) {
        const nextStatus: Array<VEHICLE_STATE> | undefined = stateTransitionDict[status][event]
        if (nextStatus) {
          graphEntries.push(`\t${generateTransitionLabel(status, nextStatus, event)}`)
        }
      }
    }
  }
  return `digraph G {\n${graphEntries.join('\n')}\n}`
}

export { stateTransitionDict, getNextState, generateGraph }
