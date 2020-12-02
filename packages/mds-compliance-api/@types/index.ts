import { ApiRequest, ApiVersionedResponse, ApiResponseLocalsClaims } from '@mds-core/mds-api-server'

export const COMPLIANCE_API_SUPPORTED_VERSIONS = ['0.0.1'] as const
export type COMPLIANCE_API_SUPPORTED_VERSION = typeof COMPLIANCE_API_SUPPORTED_VERSIONS[number]
export const [COMPLIANCE_API_DEFAULT_VERSION] = COMPLIANCE_API_SUPPORTED_VERSIONS

// Allow adding type definitions for Express Request objects
export type ComplianceApiRequest<B = {}> = ApiRequest<B>

export type ComplianceApiAccessTokenScopes = 'compliance:read' | 'compliance:read:provider'

export type ComplianceApiResponse<B = {}> = ApiVersionedResponse<COMPLIANCE_API_SUPPORTED_VERSION, B> &
  ApiResponseLocalsClaims<ComplianceApiAccessTokenScopes>
