import log from '@mds-core/mds-logger'
import { eventHandler } from './src/proc-event'

async function processData() {
  log.info('INIT')
  await eventHandler()
}

export const main = () => {
  /* eslint-reason FIXME need to refactor */
  /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
  processData()
}
