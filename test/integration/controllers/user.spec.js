const { serverInit, serverCleanup } = require('~/test/setup')
const { USER_NOT_FOUND } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')

const endpointUrl = '/users/'

let testUser
const nonExistingUserId = '6301644cb3f6e97afe2706ae'

describe('User controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should GET all users', async () => {
      const response = await app.get(endpointUrl)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          role: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          email: expect.any(String),
          isEmailConfirmed: expect.any(Boolean),
          isFirstLogin: expect.any(Boolean)
        })
      )
      testUser = response.body[0]
    })
  })

  describe(`GET ${endpointUrl}:userId`, () => {
    it('should GET user by ID', async () => {
      const { _id, role, firstName, lastName, email, isEmailConfirmed, isFirstLogin } = testUser

      const response = await app.get(endpointUrl + _id)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({ _id, role, firstName, lastName, email, isEmailConfirmed, isFirstLogin })
      )
    })

    it('should throw USER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingUserId)

      expectError(404, USER_NOT_FOUND, response)
    })
  })

  describe(`DELETE ${endpointUrl}:userId`, () => {
    it('should DELETE user by ID', async () => {
      const response = await app.delete(endpointUrl + testUser._id)

      expect(response.statusCode).toBe(204)
    })

    it('should throw USER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingUserId)

      expectError(404, USER_NOT_FOUND, response)
    })
  })
})
