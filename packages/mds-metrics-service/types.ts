/*
    Copyright 2019-2020 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { Timestamp, UUID, VEHICLE_TYPE, SingleOrArray } from '@mds-core/mds-types'

export interface ReadMetricsRequiredParameters {
  name: string
  time_bin_size: number
  start_time: Timestamp
}

export type ReadMetricsOptionalParameters = Partial<{
  end_time: Timestamp
  provider_id: SingleOrArray<UUID>
  geography_id: SingleOrArray<UUID>
  vehicle_type: SingleOrArray<VEHICLE_TYPE>
}>
