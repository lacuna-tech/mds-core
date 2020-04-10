import { ServiceResponse } from '@mds-core/mds-service-helpers'
import { Jurisdiction, UUID, Timestamp } from '@mds-core/mds-types'
import { ValidationError, ConflictError, NotFoundError, ServerError } from '@mds-core/mds-utils'
import { DeepPartial } from 'typeorm'

export type CreateJurisdictionType = Partial<Pick<Jurisdiction, 'jurisdiction_id' | 'timestamp'>> &
  Pick<Jurisdiction, 'agency_key' | 'agency_name' | 'geography_id'>

export type UpdateJurisdictionType = DeepPartial<Jurisdiction>

export interface GetJurisdictionsOptions {
  effective: Timestamp
}

export interface JurisdictionServiceInterface {
  createJurisdiction: (
    jurisdiction: CreateJurisdictionType
  ) => Promise<ServiceResponse<Jurisdiction, ValidationError | ConflictError>>
  createJurisdictions: (
    jurisdictions: CreateJurisdictionType[]
  ) => Promise<ServiceResponse<Jurisdiction[], ValidationError | ConflictError>>
  updateJurisdiction: (
    jurisdiction_id: UUID,
    update: UpdateJurisdictionType
  ) => Promise<ServiceResponse<Jurisdiction, ValidationError | NotFoundError>>
  deleteJurisdiction: (
    jurisdiction_id: UUID
  ) => Promise<ServiceResponse<Pick<Jurisdiction, 'jurisdiction_id'>, NotFoundError>>
  getJurisdictions: (
    options?: Partial<GetJurisdictionsOptions>
  ) => Promise<ServiceResponse<Jurisdiction[], ServerError>>
  getJurisdiction: (
    jurisdiction_id: UUID,
    options?: Partial<GetJurisdictionsOptions>
  ) => Promise<ServiceResponse<Jurisdiction, NotFoundError>>
}
