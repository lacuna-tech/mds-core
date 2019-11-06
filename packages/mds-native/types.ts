/*
    Copyright 2019 City of Los Angeles.

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

import { ApiRequest, ApiResponse, ApiResponseLocals } from '@mds-core/mds-api-server'
import { UUID, VehicleEvent, Recorded, Device, Provider } from '@mds-core/mds-types'
import { Params, ParamsDictionary } from 'express-serve-static-core'

// Place newer versions at the beginning of the list
const NATIVE_API_VERSIONS = ['0.1.0'] as const
type NATIVE_API_VERSION = typeof NATIVE_API_VERSIONS[number]
export const [NativeApiCurrentVersion] = NATIVE_API_VERSIONS

// Allow adding type definitions for Express Request objects
export type NativeApiRequest<P extends Params = ParamsDictionary> = ApiRequest<P>

// Allow adding type definitions for Express Response objects
export interface NativeApiResponse<T extends NativeApiResponseBody> extends ApiResponse<T> {
  locals: ApiResponseLocals & {
    provider_id: UUID
  }
}

export interface NativeApiGetEventsRequest extends NativeApiRequest<{ cursor: string }> {
  // Query string parameters always come in as strings
  query: Partial<
    {
      [P in 'limit' | 'device_id' | 'provider_id' | 'start_time' | 'end_time']: string
    }
  >
}

interface NativeApiResponseBody {
  version: NATIVE_API_VERSION
}

interface NativeApiGetEventsReponseBody extends NativeApiResponseBody {
  events: Omit<Recorded<VehicleEvent>, 'id' | 'service_area_id'>[]
  cursor: string
}

export type NativeApiGetEventsReponse = NativeApiResponse<NativeApiGetEventsReponseBody>

export type NativeApiGetVehiclesRequest = NativeApiRequest<{ device_id: UUID }>

interface NativeApiGetVehiclesResponseBody extends NativeApiResponseBody {
  vehicle: Omit<Recorded<Device>, 'id'>
}

export type NativeApiGetVehiclesResponse = NativeApiResponse<NativeApiGetVehiclesResponseBody>

export type NativeApiGetProvidersRequest = NativeApiRequest

interface NativeApiGetProvidersResponseBody extends NativeApiResponseBody {
  providers: Provider[]
}

export type NativeApiGetProvidersResponse = NativeApiResponse<NativeApiGetProvidersResponseBody>
