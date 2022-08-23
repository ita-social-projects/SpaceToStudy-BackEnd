const { serverInit, serverCleanup } = require('~/test/setup')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const User = require('~/models/user')
const Role = require('~/models/role')
const { USER_NOT_REGISTERED } = require('~/consts/errors')

describe('Admin controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  it('getAdmins', async () => {
    const response = await app.get('/admins')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([])
  })

  describe('get by id', () => {
    it('found', async () => {
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

      const { id, firstName, lastName, email } = response.body

      expect(response.statusCode).toBe(200)
      expect(id).toBe(admin._id.toString())
      expect(firstName).toBe(admin.firstName)
      expect(lastName).toBe(admin.lastName)
      expect(email).toBe(admin.email)
    })

    it('getAdmin not found', async () => {
      const id = '6301644cb3f6e97afe2706ae'

      const expectedBody = {
        code: USER_NOT_REGISTERED.code,
        message: USER_NOT_REGISTERED.message,
        status: 404
      }

      const response = await app.get(`/admins/${id}`)

      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual(expectedBody)
    })
  })
})
