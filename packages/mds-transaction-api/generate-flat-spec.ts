import $RefParser from '@apidevtools/json-schema-ref-parser'
import { writeFileSync } from 'fs'

const SPEC_DIR = 'spec'

$RefParser
  .bundle(`${SPEC_DIR}/spec.yaml`)
  .then(flatSchema => {
    writeFileSync(`${SPEC_DIR}/flat-spec.json`, JSON.stringify(flatSchema, null, 2))
    return
  })
  .catch(err => {
    console.error('Error generating flat-spec!', err)
    process.exit(1)
  })
