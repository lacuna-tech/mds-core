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

import { ApiRequest, ApiVersionedResponse, ApiClaims, ApiResponseLocals } from '@mds-core/mds-api-server'
import { GeographyMetadata, Geography, UUID } from '@mds-core/mds-types'

export const GEOGRAPHY_AUTHOR_API_SUPPORTED_VERSIONS = ['0.4.1'] as const
export type GEOGRAPHY_AUTHOR_API_SUPPORTED_VERSION = typeof GEOGRAPHY_AUTHOR_API_SUPPORTED_VERSIONS[number]
export const [GEOGRAPHY_AUTHOR_API_DEFAULT_VERSION] = GEOGRAPHY_AUTHOR_API_SUPPORTED_VERSIONS

export type GeographyAuthorApiRequest<B = {}> = ApiRequest<B>

export type GeographyAuthorApiAccessTokenScopes =
  | 'geographies:read'
  | 'geographies:read:unpublished'
  | 'geographies:read:published'
  | 'geographies:write'
  | 'geographies:publish'

export type GeographyAuthorApiResponse<B = {}> = ApiVersionedResponse<GEOGRAPHY_AUTHOR_API_SUPPORTED_VERSION, B> &
  ApiResponseLocals<ApiClaims<GeographyAuthorApiAccessTokenScopes>>

export type GetGeographyMetadatumResponse = GeographyAuthorApiResponse<{
  data: { geography_metadata: GeographyMetadata }
}>

export type GetGeographyMetadataResponse = GeographyAuthorApiResponse<{
  data: { geography_metadata: GeographyMetadata[] }
}>

export type PostGeographyResponse = GeographyAuthorApiResponse<{ data: { geography: Geography } }>

export type PutGeographyResponse = GeographyAuthorApiResponse<{ data: { geography: Geography } }>
export type PublishGeographyResponse = GeographyAuthorApiResponse<{ data: { geography: Geography } }>
export type PutGeographyMetadataResponse = GeographyAuthorApiResponse<{
  data: { geography_metadata: GeographyMetadata }
}>

export type DeleteGeographyResponse = GeographyAuthorApiResponse<{ data: { geography_id: UUID } }>
