import logger from '@mds-core/mds-logger'
import db from '@mds-core/mds-db'
import { BadParamsError } from '@mds-core/mds-utils'
import { PolicyAuthorApiRequest, PolicyAuthorGetPoliciesResponse } from './types'

const getPolicies = async (req: PolicyAuthorApiRequest, res: PolicyAuthorGetPoliciesResponse) => {
  const { get_published = null, get_unpublished = null } = req.query
  const params = { get_published, get_unpublished }
  if (get_published) {
    params.get_published = get_published === 'true'
  }
  if (get_unpublished) {
    params.get_unpublished = get_unpublished === 'true'
  }
  logger.info('read /policies', req.query)

  try {
    const policies = await db.readPolicies(params)

    // Let's not worry about filtering for just active policies at the moment.
    res.status(200).send({ version: res.locals.version, policies })
  } catch (error) {
    logger.error('failed to read policies', error)
    if (error instanceof BadParamsError) {
      res.status(400).send({
        error
      })
    } else {
      res.status(404).send({
        error
      })
    }
  }
}

export { getPolicies }
