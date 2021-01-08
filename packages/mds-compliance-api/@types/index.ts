import { ApiRequest, ApiVersionedResponse, ApiResponseLocalsClaims } from '@mds-core/mds-api-server'
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

export interface ComplianceAggregateResponse {
  start_time: Timestamp
  end_time: Timestamp
  results: ComplianceAggregate[]
}
