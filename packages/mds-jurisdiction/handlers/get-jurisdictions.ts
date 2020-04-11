import { JurisdictionServiceClient } from '@mds-core/mds-jurisdiction-service'
import { Jurisdiction } from '@mds-core/mds-types'
import { HasJurisdictionClaim, UnexpectedServiceError } from './utils'
import { JurisdictionApiRequest, JurisdictionApiResponse } from '../types'

interface GetJurisdictionsRequest extends JurisdictionApiRequest {
  // Query string parameters always come in as strings
  query: Partial<
    {
      [P in 'effective']: string
    }
  >
}

type GetJurisdictionsResponse = JurisdictionApiResponse<{
  jurisdictions: Jurisdiction[]
}>

export const GetAllJurisdictionsHandler = async (req: GetJurisdictionsRequest, res: GetJurisdictionsResponse) => {
  const { effective } = req.query

  const [error, jurisdictions] = await JurisdictionServiceClient.getJurisdictions({
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
