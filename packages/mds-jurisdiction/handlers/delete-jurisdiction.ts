/*
    Copyright 2019-2020 City of Los Angeles.

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

import { JurisdictionServiceClient, JurisdictionDomainModel } from '@mds-core/mds-jurisdiction-service'
import { isServiceError } from '@mds-core/mds-service-helpers'
import { ApiRequestParams } from '@mds-core/mds-api-server'
import { JurisdictionApiRequest, JurisdictionApiResponse } from '../@types'

export const DeleteJurisdictionHandler = async (
  req: JurisdictionApiRequest & ApiRequestParams<'jurisdiction_id'>,
  res: JurisdictionApiResponse<Pick<JurisdictionDomainModel, 'jurisdiction_id'>>
) => {
  const { jurisdiction_id } = req.params
  try {
    const result = await JurisdictionServiceClient.deleteJurisdiction(jurisdiction_id)
    const { version } = res.locals
    return res.status(200).send({ version, ...result })
  } catch (error) {
    if (isServiceError(error)) {
      if (error.type === 'NotFoundError') {
        return res.status(404).send({ error })
      }
    }
    return res.status(500).send({ error })
  }
}
