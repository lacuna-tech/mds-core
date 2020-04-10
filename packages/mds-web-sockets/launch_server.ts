import { WebSocketServer } from './server'

WebSocketServer()
  .then(() => console.log(`WebSockerServer running`))
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  .catch(err => console.log(err))
