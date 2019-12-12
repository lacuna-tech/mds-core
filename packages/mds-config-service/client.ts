import fs from 'fs'
import { format } from 'path'
import { homedir } from 'os'
import { promisify } from 'util'
import { NotFoundError, UnsupportedTypeError } from '@mds-core/mds-utils'
import JSON5 from 'json5'

const statAsync = promisify(fs.stat)
const statFile = async (path: string): Promise<string | null> => {
  try {
    const stats = await statAsync(path)
    if (stats.isFile()) {
      return path
    }
  } catch {}
  return null
}

const getFilePath = async (property: string): Promise<string> => {
  const { MDS_CONFIG_PATH = '/mds-config' } = process.env
  const dir = (MDS_CONFIG_PATH.endsWith('/') ? MDS_CONFIG_PATH : `${MDS_CONFIG_PATH}/`).replace('~', homedir())
  const json5 = await statFile(format({ dir, name: property, ext: '.json5' }))
  return json5 ?? format({ dir, name: property, ext: '.json' })
}

const readFileAsync = promisify(fs.readFile)
const readFile = async (path: string): Promise<string> => {
  try {
    const utf8 = await readFileAsync(path, { encoding: 'utf8' })
    return utf8
  } catch (error) {
    throw new NotFoundError('Settings File Not Found', error)
  }
}

const asJson = <TSettings extends {}>(utf8: string): TSettings => {
  try {
    const json: TSettings = JSON5.parse(utf8)
    return json
  } catch (error) {
    throw new UnsupportedTypeError('Settings File must contain JSON', error)
  }
}

const readJsonFile = async <TSettings extends {}>(property: string): Promise<TSettings> => {
  const path = await getFilePath(property)
  const file = await readFile(path)
  return asJson<TSettings>(file)
}

export const getSettings = async <TConfig extends {} = {}>(...properties: string[]) => {
  const settings = await Promise.all(properties.map(property => readJsonFile(property)))
  return settings.reduce<TConfig>((config, setting) => Object.assign(config, setting), {} as TConfig)
}
