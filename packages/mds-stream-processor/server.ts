import { processor } from './processors/mds-event-processor'

// eslint-disable-next-line promise/prefer-await-to-callbacks
processor
  .start()
  .then(() => console.log('RUNNING'))
  .catch(error => console.log('ERROR', error))
