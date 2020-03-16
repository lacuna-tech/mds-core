import { ProducerStream } from 'node-rdkafka'

/*
  FIXME:
  Necessary interface due to already-fixed typedef problem in the node-rdkafka repo,
  will be removed upon next upstream release
*/
export interface Producer {
  createWriteStream(conf: any, topicConf: any, streamOptions: any): ProducerStream
}

export interface ProducerOptions {
  'metadata.broker.list': string
  'queue.buffering.max.messages': number
}

export interface StreamOptions {
  topic: string
}
