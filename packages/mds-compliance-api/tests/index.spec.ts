import { ComplianceServiceManager } from '@mds-core/mds-compliance-service/service/manager'

const ComplianceServer = ComplianceServiceManager.controller()

describe('Test Compliances API', () => {
  beforeAll(async () => {
    await ComplianceServer.start()
  })

  it('Runs a test', () => {
    // eslint-disable-next-line no-console
    console.log('You did it!')
  })

  afterAll(async () => {
    await ComplianceServer.stop()
  })
})
