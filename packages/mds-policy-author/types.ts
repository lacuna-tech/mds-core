import { ApiRequest, ApiVersionedResponse } from '@mds-core/mds-api-server'
import { Policy, UUID } from '@mds-core/mds-types'

export const POLICY_AUTHOR_API_SUPPORTED_VERSIONS = ['0.1.0'] as const
export type POLICY_AUTHOR_API_SUPPORTED_VERSION = typeof POLICY_AUTHOR_API_SUPPORTED_VERSIONS[number]
export const [POLICY_AUTHOR_API_DEFAULT_VERSION] = POLICY_AUTHOR_API_SUPPORTED_VERSIONS

export type PolicyAuthorApiRequest = ApiRequest

type PolicyAuthorApiResponse<TBody extends {}> = ApiVersionedResponse<POLICY_AUTHOR_API_SUPPORTED_VERSION, TBody>

export type PolicyAuthorGetPoliciesResponse = PolicyAuthorApiResponse<{ policies: Policy[] }>
export type PolicyAuthorGetPolicyResponse = PolicyAuthorApiResponse<{ policy: Policy }>
export type PolicyAuthorCreatePolicyResponse = PolicyAuthorApiResponse<{ result: {} }>
export type PolicyAuthorEditPolicyResponse = PolicyAuthorApiResponse<{ policy: Policy }>
export type PolicyAuthorDeletePolicyResponse = PolicyAuthorApiResponse<{ policy_id: UUID }>
