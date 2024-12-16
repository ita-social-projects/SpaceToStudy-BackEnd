const mongoose = require('mongoose')
const { setupTestServer, stopServer } = require('~/test/setupSafeTest')
const { createError } = require('~/utils/errorsHelper')
const { READ_ONLY_ERROR } = require('~/consts/errors')
const restrictedOperations = require('~/consts/restrictedOperations')

describe('Restricted Operations', () => {
  let server

  beforeAll(async () => {
    const setup = await setupTestServer()
    server = setup.server
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should throw error when calling restricted operations', async () => {
    const model = mongoose.model('Test', new mongoose.Schema({ name: String }))

    for (const operation of restrictedOperations) {
      await expect(model[operation]()).rejects.toThrow(createError(403, READ_ONLY_ERROR))
    }
  })
})
