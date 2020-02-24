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
import { UUID, Jurisdiction } from '@mds-core/mds-types'
import { Params, ParamsDictionary } from 'express-serve-static-core'
import { CreateJurisdictionType } from '@mds-core/mds-jurisdiction-service'

// Place newer versions at the beginning of the list
const JURISDICTION_API_VERSIONS = ['0.1.0'] as const
type JURISDICTION_API_VERSION = typeof JURISDICTION_API_VERSIONS[number]
export const [JurisdictionApiCurrentVersion] = JURISDICTION_API_VERSIONS

// Allow adding type definitions for Express Request objects
export type JurisdictionApiRequest<P extends Params = ParamsDictionary> = ApiRequest<P>

// Allow adding type definitions for Express Response objects
export interface JurisdictionApiResponse<T> extends ApiResponse<{ version: JURISDICTION_API_VERSION } & T> {
  locals: ApiResponseLocals & {
    jurisdiction_id: UUID
  }
}

export interface JurisdictionApiGetJurisdictionsRequest extends JurisdictionApiRequest {
  // Query string parameters always come in as strings
  query: Partial<
    {
      [P in 'effective']: string
    }
  >
}

export type JurisdictionApiGetJurisdictionsResponse = JurisdictionApiResponse<{
  jurisdictions: Jurisdiction[]
}>

export interface JurisdictionApiGetJurisdictionRequest extends JurisdictionApiRequest<{ jurisdiction_id: UUID }> {
  // Query string parameters always come in as strings
  query: Partial<
    {
      [P in 'effective']: string
    }
  >
}

export type JurisdictionApiGetJurisdictionResponse = JurisdictionApiResponse<{
  jurisdiction: Jurisdiction
}>

export interface JurisdictionApiCreateJurisdictionRequest extends JurisdictionApiRequest {
  body: CreateJurisdictionType | CreateJurisdictionType[]
}

export type JurisdictionApiCreateJurisdictionResponse = JurisdictionApiResponse<
  | {
      jurisdiction: Jurisdiction
    }
  | {
      jurisdictions: Jurisdiction[]
    }
>
