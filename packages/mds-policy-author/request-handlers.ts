import log from '@mds-core/mds-logger'
import db from '@mds-core/mds-db'
import { BadParamsError } from '@mds-core/mds-utils'
import { PolicyApiRequest, PolicyApiResponse } from './types'

const getPolicies = async (req: PolicyApiRequest, res: PolicyApiResponse) => {
  const { get_published = null, get_unpublished = null } = req.query
  log.info('read /policies', req.query)

  try {
    const policies = await db.readPolicies({ get_published, get_unpublished })

    // Let's not worry about filtering for just active policies at the moment.
    res.status(200).send(policies)
  } catch (err) {
    await log.error('failed to read policies', err)
    if (err instanceof BadParamsError) {
      res.status(400).send({
        result:
          'Cannot set both get_unpublished and get_published to be true. If you want all policies, set both params to false or do not send them.'
      })
    }
    res.status(404).send({
      result: 'not found'
    })
  }
}

export { getPolicies }
