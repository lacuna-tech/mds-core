import { JurisdictionService } from '@mds-core/mds-jurisdiction-service'
import { Jurisdiction } from 'packages/mds-types'
import { HasJurisdictionClaim, UnexpectedServiceError } from './handler-utils'
import { JurisdictionApiRequest, JurisdictionApiResponse } from '../types'

interface JurisdictionApiGetAllJurisdictionsRequest extends JurisdictionApiRequest {
  // Query string parameters always come in as strings
  query: Partial<
    {
      [P in 'effective']: string
    }
  >
}

type JurisdictionApiGetAllJurisdictionsResponse = JurisdictionApiResponse<{
  jurisdictions: Jurisdiction[]
}>

export const GetAllJurisdictionsHandler = async (
  req: JurisdictionApiGetAllJurisdictionsRequest,
  res: JurisdictionApiGetAllJurisdictionsResponse
) => {
  const { effective } = req.query

  const [error, jurisdictions] = await JurisdictionService.getAllJurisdictions({
    effective: effective ? Number(effective) : undefined
  })

  // Handle result
  if (jurisdictions) {
    return res.status(200).send({
      version: res.locals.version,
      jurisdictions: jurisdictions.filter(HasJurisdictionClaim(res))
    })
  }

  // Handle errors
  return res.status(500).send({ error: UnexpectedServiceError(error) })
}
