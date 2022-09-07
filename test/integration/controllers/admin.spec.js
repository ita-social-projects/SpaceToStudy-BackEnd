const { serverInit, serverCleanup } = require('~/test/setup')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const User = require('~/models/user')
const Role = require('~/models/role')
const { USER_NOT_FOUND } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')

describe('Admin controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe('admins endpoint', () => {
    it('should get admins', async () => {
      const response = await app.get('/admins')

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual([])
    })
  })

  describe('admins/:id endpoint', () => {
    it('should get admin by id', async () => {
      const role = await Role.findOne({ value: ADMIN }).lean().exec()
      let adminToSave = {
        role,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password'
      }

      const admin = await User.create(adminToSave)

      const response = await app.get(`/admins/${admin._id}`)

      const { id, firstName, lastName, email } = admin

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          id,
          firstName,
          lastName,
          email
        })
      )
    })

    it('should throw USER_NOT_FOUND', async () => {
      const id = '6301644cb3f6e97afe2706ae'

      const response = await app.get(`/admins/${id}`)

      expectError(404, USER_NOT_FOUND, response)
    })
  })
})
