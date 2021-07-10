/**
 * Copyright 2019 City of Los Angeles
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

import {
  ApiRequest,
  ApiRequestParams,
  ApiRequestQuery,
  ApiResponseLocalsClaims,
  ApiVersionedResponse
} from '@mds-core/mds-api-server'
import { ModalityPolicy, PolicyMetadata, PolicyTypeInfo, UUID } from '@mds-core/mds-types'

export const POLICY_AUTHOR_API_SUPPORTED_VERSIONS = ['1.0.0'] as const
export type POLICY_AUTHOR_API_SUPPORTED_VERSION = typeof POLICY_AUTHOR_API_SUPPORTED_VERSIONS[number]
export const [POLICY_AUTHOR_API_DEFAULT_VERSION] = POLICY_AUTHOR_API_SUPPORTED_VERSIONS

export type PolicyAuthorApiRequest<B = {}> = ApiRequest<B>

export type PolicyAuthorApiPostPolicyRequest<PInfo extends PolicyTypeInfo> = PolicyAuthorApiRequest<PInfo['Policy']>
export type PolicyAuthorApiPublishPolicyRequest = PolicyAuthorApiRequest & ApiRequestParams<'policy_id'>
export type PolicyAuthorApiEditPolicyRequest = PolicyAuthorApiRequest<ModalityPolicy>
export type PolicyAuthorApiDeletePolicyRequest = PolicyAuthorApiRequest & ApiRequestParams<'policy_id'>
export type PolicyAuthorApiGetPolicyMetadataRequest = PolicyAuthorApiRequest &
  ApiRequestQuery<'get_published' | 'get_unpublished'>
export type PolicyAuthorApiGetPolicyMetadatumRequest = PolicyAuthorApiRequest & ApiRequestParams<'policy_id'>
export type PolicyAuthorApiEditPolicyMetadataRequest = PolicyAuthorApiRequest<PolicyMetadata>

export type PolicyAuthorApiAccessTokenScopes =
  | 'policies:read'
  | 'policies:write'
  | 'policies:publish'
  | 'policies:delete'

type PolicyAuthorApiResponse<B = {}> = ApiVersionedResponse<POLICY_AUTHOR_API_SUPPORTED_VERSION, B> &
  ApiResponseLocalsClaims<PolicyAuthorApiAccessTokenScopes>

export type PolicyAuthorApiGetPoliciesResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policies: PInfo['Policy'][] }
}>
export type PolicyAuthorApiGetPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiPostPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiPublishPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiEditPolicyResponse<PInfo extends PolicyTypeInfo> = PolicyAuthorApiResponse<{
  data: { policy: PInfo['Policy'] }
}>
export type PolicyAuthorApiDeletePolicyResponse = PolicyAuthorApiResponse<{
  data: { policy_id: UUID }
}>

export type PolicyAuthorApiGetPolicyMetadatumResponse = PolicyAuthorApiResponse<{
  data: { policy_metadata: PolicyMetadata }
}>
export type PolicyAuthorApiGetPolicyMetadataResponse = PolicyAuthorApiResponse<{
  data: { policy_metadata: PolicyMetadata[] }
}>
export type PolicyAuthorApiEditPolicyMetadataResponse = PolicyAuthorApiResponse<{
  data: { policy_metadata: PolicyMetadata }
}>
