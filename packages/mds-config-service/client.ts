import fs from 'fs'
import { promisify } from 'util'
import { NotFoundError, UnsupportedTypeError } from '@mds-core/mds-utils'

const readFileAsync = async (path: string): Promise<string> => {
  try {
    const utf8 = await promisify(fs.readFile)(path, { encoding: 'utf8' })
    return utf8
  } catch (error) {
    throw new NotFoundError('Settings File Not Found', error)
  }
}

const asJson = <TSettings extends object>(utf8: string): TSettings => {
  try {
    const json: TSettings = JSON.parse(utf8)
    return json
  } catch (error) {
    throw new UnsupportedTypeError('Settings File must contain JSON', error)
  }
}

export const getSettings = async <TSettings extends object>(name = 'settings'): Promise<TSettings> => {
  const { MDS_CONFIG_PATH = '.' } = process.env
  const path = MDS_CONFIG_PATH.endsWith('/') ? MDS_CONFIG_PATH : `${MDS_CONFIG_PATH}/`
  return asJson<TSettings>(await readFileAsync(`${path}${name}.json`))
}
