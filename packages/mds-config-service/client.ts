import fs from 'fs'
import { promisify } from 'util'
import { NotFoundError } from '@mds-core/mds-utils'

export const getSettings = async <TSettings extends object>(name = 'settings'): Promise<TSettings> => {
  const { MDS_CONFIG_PATH = '.' } = process.env
  const path = MDS_CONFIG_PATH.endsWith('/') ? MDS_CONFIG_PATH : `${MDS_CONFIG_PATH}/`
  try {
    const utf8 = await promisify(fs.readFile)(`${path}${name}.json`, { encoding: 'utf8' })
    const json: TSettings = JSON.parse(utf8)
    return json
  } catch (error) {
    throw new NotFoundError('Settings File Not Found', error)
  }
}
