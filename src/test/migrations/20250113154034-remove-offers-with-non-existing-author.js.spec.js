const { serverInit, serverCleanup, stopServer } = require('~/test/setup')

describe('20250113154034-remove-offers-with-non-existing-author.js', () => {
  let server

  beforeAll(async () => ({ server } = await serverInit()))

  afterEach(async () => await serverCleanup())

  afterAll(async () => await stopServer(server))
})
