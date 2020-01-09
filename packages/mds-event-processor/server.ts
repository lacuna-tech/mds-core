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

import { EventServer, initializeStanSubscriber } from '@mds-core/mds-event-server'
import processor from '@mds-core/mds-event-processor'

const {
  env: { npm_package_name, PORT = 5000, STAN, STAN_CLUSTER, STAN_CREDS, TENANT_ID = 'mds' },
  pid
} = process

/* eslint-reason avoids import of logger */
/* eslint-disable-next-line no-console */
EventServer(processor).listen(PORT, () => {
  console.log(`${npm_package_name} running on port ${PORT}`)
  if (STAN && STAN_CLUSTER && TENANT_ID && STAN_CREDS)
    initializeStanSubscriber({ STAN, STAN_CLUSTER, STAN_CREDS, TENANT_ID, pid, processor })
  else console.log(`Cannot initialize STAN Subscribers. One of STAN, STAN_CLUSTER, or TENANT_ID is undefined.`)
})
