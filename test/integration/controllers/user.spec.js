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
      expect(response.body[0]._id).toBeDefined()
      expect(response.body[0].firstName).toBeDefined()
      expect(response.body[0].lastName).toBeDefined()
      expect(response.body[0].email).toBeDefined()
      expect(response.body[0].isEmailConfirmed).toBeDefined()
      expect(response.body[0].isFirstLogin).toBeDefined()
      expect(response.body[0].lastLogin).toBeDefined()
      testUser = response.body[0]
    })
  })

  describe(`GET ${endpointUrl}:userId`, () => {
    it('should GET user by ID', async () => {
      const response = await app.get(endpointUrl + testUser._id)

      expect(response.statusCode).toBe(200)
      expect(response.body.role).toBe(testUser.role)
      expect(response.body.firstName).toBe(testUser.firstName)
      expect(response.body.lastName).toBe(testUser.lastName)
      expect(response.body.email).toBe(testUser.email)
      expect(response.body.isEmailConfirmed).toBe(testUser.isEmailConfirmed)
      expect(response.body.isFirstLogin).toBe(testUser.isFirstLogin)
      expect(response.body.lastLogin).toBe(testUser.lastLogin)
    })

    it('should throw 404, USER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingUserId)

      expectError(404, USER_NOT_FOUND, response)
    })
  })

  describe(`DELETE ${endpointUrl}:userId`, () => {
    it('should DELETE user by ID', async () => {
      const response = await app.delete(endpointUrl + testUser._id)

      expect(response.statusCode).toBe(204)
    })

    it('should throw 404, USER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingUserId)

      expectError(404, USER_NOT_FOUND, response)
    })
  })
})
