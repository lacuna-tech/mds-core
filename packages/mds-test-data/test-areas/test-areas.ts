import { UUID, Nullable } from '@mds-core/mds-types'
import { Geometry } from 'geojson'

/* eslint-disable @typescript-eslint/no-var-requires */
const laCityBoundary = require('./la-city-boundary')
const restrictedAreas = require('./restricted-areas')
const laDacs = require('./la-dacs')
const veniceSpecOps = require('./venice-special-ops-zone')
const venice = require('./venice')
const councilDistrict11 = require('./council-district-11')

const serviceAreaMap: {
  [key: string]: {
    start_date: number
    end_date: Nullable<number>
    prev_area: Nullable<UUID>
    replacement_area: Nullable<UUID>
    type: string
    description: string
    area: Geometry
  }
} = {
  // LA city boundary
  '1f943d59-ccc9-4d91-b6e2-0c5e771cbc49': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'unrestricted',
    description: 'Los Angeles',
    area: laCityBoundary.features[0].geometry
  },

  // Council District 11
  '8cfe393c-4dc8-4a1d-922e-034f8577c507': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'restricted',
    description: 'Council District 11',
    area: councilDistrict11.features[0].geometry
  },

  // Venice
  '3abf8e10-a380-45bb-bfd4-ec5b21b1b0b6': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'restricted',
    description: 'Venice',
    area: venice.features[0].geometry
  },

  // Venice Beach "Special Ops Zone"
  'e0e4a085-7a50-43e0-afa4-6792ca897c5a': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'restricted',
    description: 'Venice Beach Special Operations Zone',
    area: veniceSpecOps.features[0].geometry
  },

  // Venice Beach
  'ff822e26-a70c-4721-ac32-2f6734beff9b': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'restricted',
    description: 'Venice Beach',
    area: restrictedAreas.features[0].geometry
  },

  // Venice canals
  '43f329fc-335a-4495-b542-6b516def9269': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'restricted',
    description: 'Venice Canals',
    area: restrictedAreas.features[1].geometry
  },

  // San Fernando Valley DAC
  'e3ed0a0e-61d3-4887-8b6a-4af4f3769c14': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'unrestricted',
    description: 'San Fernando Valley DAC',
    area: laDacs.features[1].geometry
  },

  // Non San Fernando Valley DAC
  '0c444869-1674-4234-b4f3-ab5685bcf0d9': {
    start_date: 0,
    end_date: null,
    prev_area: null,
    replacement_area: null,
    type: 'unrestricted',
    description: 'Non San Fernando Valley DAC',
    area: laDacs.features[0].geometry
  }
}

export { serviceAreaMap }
