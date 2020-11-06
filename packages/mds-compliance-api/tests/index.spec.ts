import { ComplianceServiceManager } from '@lacuna-core/lacuna-compliance-service/service/manager'

const ComplianceServer = ComplianceServiceManager.controller()

describe('Test Compliance API', () => {
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
