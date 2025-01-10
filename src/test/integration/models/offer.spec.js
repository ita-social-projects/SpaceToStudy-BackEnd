const { setupTestServer, stopServer } = require('~/test/setupSafeTest')

describe('Offer model', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })
})
