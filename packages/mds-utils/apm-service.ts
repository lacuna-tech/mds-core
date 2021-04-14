import apm from 'elastic-apm-node'
import logger from '@mds-core/mds-logger'

export const apmStart = () => {
  logger.info(`Starting APM instrumentation:`)
  apm.start()
}

export const apmCaptureError = (error: Error) => {
  apm.setTransactionOutcome('failure')
  apm.captureError(error, {}, err => {
    if (err) {
      logger.error(`unable to capture error to elastic-apm: ${err}`)
    }
  })
}

export const apmSetTransactionName = (name: string) => apm.setTransactionName(name)
