import { ApiVersionMiddleware } from '@mds-core/mds-api-server'
import { AUDIT_API_SUPPORTED_VERSIONS, AUDIT_API_DEFAULT_VERSION } from '../types'

export const AuditApiVersionMiddleware = ApiVersionMiddleware(
  'application/vnd.mds.audit+json',
  AUDIT_API_SUPPORTED_VERSIONS
).withDefaultVersion(AUDIT_API_DEFAULT_VERSION)
