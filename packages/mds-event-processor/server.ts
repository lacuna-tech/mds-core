/* eslint-disable @typescript-eslint/no-floating-promises */
/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import processor from '@mds-core/mds-event-processor'
import NATS from 'nats'
import stan from 'node-nats-streaming'
import { StringDecoder } from 'string_decoder'
import uuid from 'uuid'

const {
  env: { STAN = 'localhost', STAN_CLUSTER = 'stan', STAN_CREDS = 'stan.creds', TENANT_ID = 'mds' }
} = process

/* eslint-reason avoids import of logger */
/* eslint-disable-next-line no-console */

if (STAN && STAN_CLUSTER && TENANT_ID && STAN_CREDS) {
  const decoder = new StringDecoder('utf8')

  const natsClient = NATS.connect({ url: `nats://${STAN}:4222`, userCreds: STAN_CREDS, encoding: 'binary' })

  const nats = stan.connect(STAN_CLUSTER, `mds-event-processor-${uuid()}`, {
    nc: natsClient
  })

  try {
    nats.on('connect', () => {
      const eventSubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.event`, {
        ...nats.subscriptionOptions(),
        manualAcks: true,
        maxInFlight: 1
      })

      eventSubscription.on('message', async (msg: any) => {
        const {
          spec: {
            payload: { data }
          }
        } = JSON.parse(msg.getRawData().toString())
        const parsedData = JSON.parse(data)
        await processor('event', parsedData)
        msg.ack()
      })

      const telemetrySubscription = nats.subscribe(`${TENANT_ID ?? 'mds'}.telemetry`, {
        ...nats.subscriptionOptions(),
        manualAcks: true,
        maxInFlight: 1
      })

      telemetrySubscription.on('message', async (msg: any) => {
        const {
          spec: {
            payload: { data }
          }
        } = JSON.parse(msg.getRawData().toString())
        const parsedData = JSON.parse(data)
        await processor('telemetry', parsedData)
        msg.ack()
      })
    })
  } catch (err) {
    console.log(err)
  }
} else console.log(`Cannot initialize STAN Subscribers. One of STAN, STAN_CLUSTER, or TENANT_ID is undefined.`)
