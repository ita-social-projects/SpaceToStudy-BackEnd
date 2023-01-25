const { serverInit, serverCleanup } = require('~/test/setup')
const {
  roles: { ADMIN }
} = require('~/consts/auth')
const Admin = require('~/models/admin')
const { USER_NOT_FOUND, USER_ALREADY_BLOCKED, USER_ALREADY_UNBLOCKED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const {
  enums: { LANG_ENUM }
} = require('~/consts/validation')

const testAdmin = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@gmail.com',
  password: 'password'
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

  describe('admins endpoint', () => {
    it('should get admins', async () => {
      const params = new URLSearchParams()
      params.set('skip', 0)
      params.set('limit', 10)
      params.set('name', '')
      params.set('email', '')
      params.set('active', '1')
      params.set('blocked', '0')
      params.set('signUpDateFrom', new Date().toISOString())
      params.set('signUpDateTo', new Date().toISOString())
      params.set('lastLoginFrom', new Date().toISOString())
      params.set('lastLoginTo', new Date().toISOString())
      params.set('sortByName', '1')
      params.set('sortByEmail', '1')
      params.set('sortByLastLogin', '1')
      params.set('sortBySignUpDate', '1')

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

  describe('admins/:id endpoint', () => {
    describe('GET admins/:id', () => {
      it('should get admin by id', async () => {
        const admin = await Admin.create(testAdmin)

        const url = `/admins/${admin._id}`
        const response = await app.get(url)

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual(
          expect.objectContaining({
            role: ADMIN,
            firstName: testAdmin.firstName,
            lastName: testAdmin.lastName,
            email: testAdmin.email,
            language: LANG_ENUM[0]
          })
        )

        testAdmin._id = admin._id
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `/admins/${nonExistingAdminId}`
        const response = await app.get(url)

        expectError(404, USER_NOT_FOUND, response)
      })
    })

    describe('PATCH admins/:id', () => {
      it('should update admin by id', async () => {
        const url = `/admins/${testAdmin._id}`
        const response = await app.patch(url).send(testAdmin)

        expect(response.statusCode).toBe(204)
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `/admins/${nonExistingAdminId}`
        const response = await app.patch(url).send(testAdmin)

        expectError(404, USER_NOT_FOUND, response)
      })
    })

    describe('DELETE admins/:id', () => {
      it('should delete admin by id', async () => {
        const url = `/admins/${testAdmin._id}`
        const response = await app.delete(url)

        const adminById = await Admin.findById(testAdmin._id).lean().exec()

        expect(adminById).toBeNull()
        expect(response.statusCode).toBe(204)
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `/admins/${nonExistingAdminId}`
        const response = await app.delete(url)

        expectError(404, USER_NOT_FOUND, response)
      })
    })
  })

  describe('admins/:id/block endpoint', () => {
    describe('PATCH admins/:id/block', () => {
      it('should block admin by id', async () => {
        delete testAdmin._id
        await Admin.deleteOne({
          email: testAdmin.email
        })
        const admin = await Admin.create(testAdmin)

        const url = `/admins/${admin._id}/block`
        const response = await app.patch(url)

        expect(response.statusCode).toBe(204)

        testAdmin._id = admin._id
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `/admins/${nonExistingAdminId}/block`
        const response = await app.patch(url)

        expectError(404, USER_NOT_FOUND, response)
      })

      it('should throw USER_ALREADY_BLOCKED', async () => {
        const url = `/admins/${testAdmin._id}/block`
        const response = await app.patch(url)

        expectError(409, USER_ALREADY_BLOCKED, response)
      })
    })
  })

  describe('admins/:id/unblock endpoint', () => {
    describe('PATCH admins/:id/unblock', () => {
      it('should unblock admin by id', async () => {
        delete testAdmin._id
        await Admin.deleteOne({
          email: testAdmin.email
        })

        const admin = await Admin.create({
          ...testAdmin,
          blocked: true
        })

        const url = `/admins/${admin._id}/unblock`
        const response = await app.patch(url)

        expect(response.statusCode).toBe(204)

        testAdmin._id = admin._id
      })

      it('should throw USER_NOT_FOUND', async () => {
        const url = `/admins/${nonExistingAdminId}/unblock`
        const response = await app.patch(url)

        expectError(404, USER_NOT_FOUND, response)
      })

      it('should throw USER_ALREADY_UNBLOCKED', async () => {
        const url = `/admins/${testAdmin._id}/unblock`
        const response = await app.patch(url)

        expectError(409, USER_ALREADY_UNBLOCKED, response)
      })
    })
  })
})
