import { Policy } from '@mds-core/mds-types'
import fs from 'fs'

export async function readJson(path: string): Promise<Policy[]> {
  return Promise.resolve(JSON.parse(fs.readFileSync(path).toString()))
}
