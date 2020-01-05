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

import kubemq from 'kubemq-nodejs'
import processor from './index'

/* eslint-reason avoids import of logger */
/* eslint-disable-next-line no-console */

const eventSub = new kubemq.Subscriber('localhost', '50000', 'sub', 'mds.event')
const telemetrySub = new kubemq.Subscriber('localhost', '50000', 'sub', 'mds.telemetry')

// sub.subscribeToEvents((msg: any) => {
//   processor('mds.event', JSON.parse(String.fromCharCode.apply(null, msg.Body)))
// })

eventSub.subscribeToEvents(
  (msg: any) => {
    processor('event', JSON.parse(String.fromCharCode.apply(null, msg.Body)))
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (err: any) => {
    // eslint-disable-next-line no-console
    console.log(`error:${err}`)
  }
)

telemetrySub.subscribeToEvents(
  (msg: any) => {
    processor('telemetry', JSON.parse(String.fromCharCode.apply(null, msg.Body)))
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (err: any) => {
    // eslint-disable-next-line no-console
    console.log(`error:${err}`)
  }
)

// EventServer(processor).listen(PORT, () => console.log(`${npm_package_name} running on port ${PORT}`))
