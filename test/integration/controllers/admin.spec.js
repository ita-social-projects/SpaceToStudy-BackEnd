const { serverInit, serverCleanup } = require('~/test/setup')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const User = require('~/models/user')
const { USER_NOT_FOUND, USER_ALREADY_BLOCKED, USER_ALREADY_UNBLOCKED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')

const endpointUrl = '/admins/'
const testAdmin = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@gmail.com',
  password: 'password',
  role: [ADMIN]
}
const nonExistingAdminId = '63ce52c1df0dee9758873429'

describe('Admin controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`${endpointUrl} endpoint`, () => {
    it('should get admins', async () => {
      const params = new URLSearchParams()
      params.set('skip', '0')
      params.set('limit', '10')
      params.set('name', '')
      params.set('email', '')
      params.set('active', '1')
      params.set('blocked', '0')
      params.set('createdAtFrom', new Date().toISOString())
      params.set('createdAtTo', new Date().toISOString())
      params.set('lastLoginFrom', new Date().toISOString())
      params.set('lastLoginTo', new Date().toISOString())
      params.set('sortByName', '1')
      params.set('sortByEmail', '1')
      params.set('sortByCreatedAt', '1')
      params.set('sortByLastLogin', '1')

      const url = `/admins?${params.toString()}`
      const response = await app.get(url)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          items: [],
          count: 0
        })
      )
    })
  })

  describe(`${endpointUrl} :id endpoint`, () => {
    describe(`GET ${endpointUrl}:id`, () => {
      it('should get admin by id', async () => {
        const admin = await User.create(testAdmin)

        const { _id, role, firstName, lastName, email, averageRating, lastLogin, totalReviews, createdAt, updatedAt } =
          admin

        const url = `/admins/${admin._id}`
        const response = await app.get(url)

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
          _id: _id.toString(),
          role,
          firstName,
          lastName,
          email,
          averageRating,
          lastLogin,
          totalReviews,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
          categories: [],
          __v: 0
        })

        testAdmin._id = admin._id
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `${endpointUrl}${nonExistingAdminId}`
        const response = await app.get(url)

        expectError(404, USER_NOT_FOUND, response)
      })
    })

    describe(`PATCH ${endpointUrl}:id`, () => {
      it('should update admin by id', async () => {
        const url = `${endpointUrl}${testAdmin._id}`
        const response = await app.patch(url).send(testAdmin)

        expect(response.statusCode).toBe(204)
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `${endpointUrl}${nonExistingAdminId}`
        const response = await app.patch(url).send(testAdmin)

        expectError(404, USER_NOT_FOUND, response)
      })
    })

    describe(`DELETE ${endpointUrl}:id`, () => {
      it('should delete admin by id', async () => {
        const url = `${endpointUrl}${testAdmin._id}`
        const response = await app.delete(url)

        const adminById = await User.findById(testAdmin._id).lean().exec()

        expect(adminById).toBeNull()
        expect(response.statusCode).toBe(204)
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `${endpointUrl}${nonExistingAdminId}`
        const response = await app.delete(url)

        expectError(404, USER_NOT_FOUND, response)
      })
    })
  })

  describe(`${endpointUrl}:id/block endpoint`, () => {
    describe(`PATCH ${endpointUrl}:id/block`, () => {
      it('should block admin by id', async () => {
        await User.deleteOne({
          email: testAdmin.email
        })
        delete testAdmin._id

        const admin = await User.create(testAdmin)

        const url = `/admins/${admin._id}/block`
        const response = await app.patch(url)

        expect(response.statusCode).toBe(204)

        testAdmin._id = admin._id
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `${endpointUrl}${nonExistingAdminId}/block`
        const response = await app.patch(url)

        expectError(404, USER_NOT_FOUND, response)
      })

      it('should throw USER_ALREADY_BLOCKED', async () => {
        const url = `${endpointUrl}${testAdmin._id}/block`
        const response = await app.patch(url)

        expectError(409, USER_ALREADY_BLOCKED, response)
      })
    })
  })

  describe(`${endpointUrl}:id/unblock endpoint`, () => {
    describe(`PATCH ${endpointUrl}:id/unblock`, () => {
      it('should unblock admin by id', async () => {
        delete testAdmin._id
        await User.deleteOne({
          email: testAdmin.email
        })

        const admin = await User.create({
          ...testAdmin,
          blocked: true
        })

        const url = `${endpointUrl}${admin._id}/unblock`
        const response = await app.patch(url)

        expect(response.statusCode).toBe(204)

        testAdmin._id = admin._id
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `${endpointUrl}${nonExistingAdminId}/unblock`
        const response = await app.patch(url)

        expectError(404, USER_NOT_FOUND, response)
      })

      it('should throw USER_ALREADY_UNBLOCKED', async () => {
        const url = `${endpointUrl}${testAdmin._id}/unblock`
        const response = await app.patch(url)

        expectError(409, USER_ALREADY_UNBLOCKED, response)
      })
    })
  })
})
