import webpack from '@mds-core/mds-webpack-config'

export default webpack
  .Bundle('../../packages/mds-stream-processor/events.ts', { name: 'processor' })
  .UsingDefaultConfig()
