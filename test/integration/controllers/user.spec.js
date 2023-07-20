const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const User = require('~/models/user')
const { DOCUMENT_NOT_FOUND, FORBIDDEN, UNAUTHORIZED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const {
  enums: { STATUS_ENUM }
} = require('~/consts/validation')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')

const endpointUrl = '/users/'
const logoutEndpoint = '/auth/logout'

let testUser = {
  role: ['student'],
  firstName: 'john',
  lastName: 'doe',
  email: 'johndoe@gmail.com',
  password: 'supersecretpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

let adminUser = {
  role: ['admin'],
  firstName: 'TestAdmin',
  lastName: 'AdminTest',
  email: 'testadmin@gmail.com',
  password: 'supersecretpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  isFirstLogin: false,
  lastLoginAs: 'admin'
}

const updateUserData = {
  firstName: 'Albus',
  lastName: 'Dumbledore'
}

const nonExistingUserId = '6329a8c501bd35b52a5ecf8c'

describe('User controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('Allowed endpoints', () => {
    let accessToken

    beforeEach(async () => {
      accessToken = await testUserAuthentication(app)
    })

    afterEach(async () => {
      await app.post('/auth/logout')
    })

    describe(`GET ${endpointUrl}`, () => {
      beforeEach(async () => {
        await User.create(testUser)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(endpointUrl)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should GET all users', async () => {
        const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

        expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.body.items)).toBeTruthy()
        expect(response.body.items[response.body.items.length - 1]).toMatchObject({
          totalReviews: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          averageRating: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          status: expect.objectContaining({
            student: expect.any(String),
            tutor: expect.any(String),
            admin: expect.any(String)
          }),
          _id: expect.any(String),
          role: expect.any(Array),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          mainSubjects: expect.objectContaining({
            tutor: expect.any(Array),
            student: expect.any(Array)
          }),
          lastLogin: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      })

      it('should GET all users which match query', async () => {
        const query = {
          email: testUser.email
        }

        const response = await app.get(endpointUrl).query(query).set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.items)).toBeTruthy()
        expect(response.body.items.length).toBe(1)
        expect(response.body.items[0]).toMatchObject({
          totalReviews: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          averageRating: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          status: expect.objectContaining({
            student: expect.any(String),
            tutor: expect.any(String),
            admin: expect.any(String)
          }),
          _id: expect.any(String),
          role: expect.any(Array),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          mainSubjects: expect.objectContaining({
            student: expect.any(Array),
            tutor: expect.any(Array)
          }),
          lastLogin: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
        expect(response.body.count).toBe(1)
      })
    })

    describe(`GET ${endpointUrl}:id`, () => {
      let user

      beforeEach(async () => {
        user = await User.create(testUser)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(endpointUrl + user._id)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should GET user by ID', async () => {
        const response = await app.get(endpointUrl + user._id).set('Authorization', `Bearer ${accessToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body).toMatchObject({
          totalReviews: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          averageRating: expect.objectContaining({
            student: expect.any(Number),
            tutor: expect.any(Number)
          }),
          status: expect.objectContaining({
            student: expect.any(String),
            tutor: expect.any(String),
            admin: expect.any(String)
          }),
          _id: expect.any(String),
          role: expect.any(Array),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          email: testUser.email,
          mainSubjects: expect.objectContaining({
            student: expect.any(Array),
            tutor: expect.any(Array)
          }),
          lastLogin: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app.get(endpointUrl + nonExistingUserId).set('Authorization', `Bearer ${accessToken}`)
        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })
    })

    describe(`UPDATE ${endpointUrl}:id`, () => {
      it('should UPDATE USER PROFILE by his ID', async () => {
        const { id: currentUserId } = TokenService.validateAccessToken(accessToken)

        const response = await app
          .patch(endpointUrl + currentUserId)
          .send(updateUserData)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.statusCode).toBe(204)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.patch(endpointUrl + nonExistingUserId).send(updateUserData)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should throw FORBIDDEN', async () => {
        const user = await User.create(testUser)

        const response = await app
          .patch(endpointUrl + user._id)
          .send(updateUserData)
          .set('Authorization', `Bearer ${accessToken}`)

        expectError(403, FORBIDDEN, response)
      })
    })
  })
  describe('Restricted endpoints only by admin access rights', () => {
    let accessToken, currentUser

    beforeEach(async () => {
      accessToken = await testUserAuthentication(app, adminUser)
      currentUser = TokenService.validateAccessToken(accessToken)
    })

    afterEach(async () => {
      await app.post(logoutEndpoint)
    })

    describe(`UPDATE ${endpointUrl}:id/change-status`, () => {
      const changeStatusPath = '/change-status'
      const mockedStatus = { tutor: STATUS_ENUM[0] }

      it('should UPDATE user by ID', async () => {
        const response = await app
          .patch(endpointUrl + currentUser.id + changeStatusPath)
          .send(mockedStatus)
          .set('Authorization', `Bearer ${accessToken}`)

        expect(response.statusCode).toBe(204)
      })

      it('should throw FORBIDDEN', async () => {
        await app.post(logoutEndpoint)

        const noPermissionsAccessToken = await testUserAuthentication(app, {
          ...testUser,
          role: TUTOR
        })
        const userWithNoPermissions = TokenService.validateAccessToken(noPermissionsAccessToken)

        const response = await app
          .patch(endpointUrl + userWithNoPermissions.id + changeStatusPath)
          .send(mockedStatus)
          .set('Authorization', `Bearer ${noPermissionsAccessToken}`)

        expectError(403, FORBIDDEN, response)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.patch(endpointUrl + currentUser._id + changeStatusPath).send(mockedStatus)

        expectError(401, UNAUTHORIZED, response)
      })
    })

    describe(`DELETE ${endpointUrl}:id`, () => {
      it('should DELETE user by ID', async () => {
        const response = await app.delete(endpointUrl + currentUser.id).set('Authorization', `Bearer ${accessToken}`)

        expect(response.statusCode).toBe(204)
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app.delete(endpointUrl + nonExistingUserId).set('Authorization', `Bearer ${accessToken}`)

        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })

      it('should throw FORBIDDEN', async () => {
        await app.post(logoutEndpoint)

        const noPermissionsAccessToken = await testUserAuthentication(app, {
          ...testUser,
          role: TUTOR
        })
        const userWithNoPermissions = TokenService.validateAccessToken(noPermissionsAccessToken)

        const response = await app
          .delete(endpointUrl + userWithNoPermissions.id)
          .set('Authorization', `Bearer ${noPermissionsAccessToken}`)

        expectError(403, FORBIDDEN, response)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.delete(endpointUrl + testUser._id)

        expectError(401, UNAUTHORIZED, response)
      })
    })
  })
})
