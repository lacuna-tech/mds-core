import fs from 'fs'
import { format, normalize } from 'path'
import { homedir } from 'os'
import { promisify } from 'util'
import logger from '@mds-core/mds-logger'
import { NotFoundError, UnsupportedTypeError } from '@mds-core/mds-utils'
import JSON5 from 'json5'

type GetSettingsSuccess<TSettings> = [null, TSettings]
const Success = <TSettings>(result: TSettings): GetSettingsSuccess<TSettings> => [null, result]

type GetSettingsFailure = [Error, null]
const Failure = (error: Error): GetSettingsFailure => [error, null]

type GetSettingsResult<TSettings> = GetSettingsSuccess<TSettings> | GetSettingsFailure

const getFilePath = (property: string, ext: '.json' | '.json5'): string => {
  const { MDS_CONFIG_PATH = '/mds-config' } = process.env
  const dir = MDS_CONFIG_PATH.replace('~', homedir())
  return normalize(format({ dir, name: property, ext }))
}

const readFileAsync = promisify(fs.readFile)
const readFile = async (path: string): Promise<string> => {
  try {
    const utf8 = await readFileAsync(path, { encoding: 'utf8' })
    return utf8
  } catch (error) {
    throw new NotFoundError('Settings File Not Found', { error, path })
  }
}

const readJsonFile = async <TSettings>(property: string): Promise<TSettings> => {
  try {
    const json5 = await readFile(getFilePath(property, '.json5'))
    try {
      return JSON5.parse(json5)
    } catch (error) {
      throw new UnsupportedTypeError('Settings File must contain JSON', { error })
    }
  } catch {
    const json = await readFile(getFilePath(property, '.json'))
    try {
      return JSON.parse(json)
    } catch (error) {
      throw new UnsupportedTypeError('Settings File must contain JSON', { error })
    }
  }
}

export const client = {
  getSettings: async <TSettings>(properties: string[]): Promise<GetSettingsResult<TSettings>> => {
    try {
      const settings = await Promise.all(properties.map(property => readJsonFile(property)))
      return Success(settings.reduce<TSettings>((merged, setting) => Object.assign(merged, setting), {} as TSettings))
    } catch (error) {
      return Failure(error)
    }
  }
}

const loadSettings = async <TSettings>(properties: string[]): Promise<GetSettingsResult<TSettings>> => {
  const loaded = await client.getSettings<TSettings>(properties)
  const [error, settings] = loaded
  await (settings === null
    ? logger.error('Failed to load configuration', properties, error)
    : logger.info('Loaded configuration', properties, settings))
  return loaded
}

export const ConfigurationManager = <TSettings>(properties: string[]) => {
  let cached: GetSettingsResult<TSettings> | null = null
  return {
    settings: async (): Promise<TSettings> => {
      cached = cached ?? (await loadSettings<TSettings>(properties))
      const [error, settings] = cached
      if (settings !== null) {
        return settings
      }
      throw error
    }
  }
}
