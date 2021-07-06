/**
 * Copyright 2021 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiRequest, ApiResponseLocalsClaims, ApiVersionedResponse } from '@mds-core/mds-api-server'
import { Timestamp, UUID } from '@mds-core/mds-types'

export const COMPLIANCE_API_SUPPORTED_VERSIONS = ['1.1.0'] as const
export type COMPLIANCE_API_SUPPORTED_VERSION = typeof COMPLIANCE_API_SUPPORTED_VERSIONS[number]
export const [COMPLIANCE_API_DEFAULT_VERSION] = COMPLIANCE_API_SUPPORTED_VERSIONS

// Allow adding type definitions for Express Request objects
export type ComplianceApiRequest<B = {}> = ApiRequest<B>

export type ComplianceApiAccessTokenScopes = 'compliance:read' | 'compliance:read:provider'

export type ComplianceApiResponse<B = {}> = ApiVersionedResponse<COMPLIANCE_API_SUPPORTED_VERSION, B> &
  ApiResponseLocalsClaims<ComplianceApiAccessTokenScopes>

export interface ComplianceViolationPeriod {
  snapshots_uri?: string
  start_time: Timestamp
  end_time: Timestamp | null
}

export interface ComplianceAggregate {
  policy_id: UUID
  provider_id: UUID
  provider_name: string
  violation_periods: ComplianceViolationPeriod[]
}
