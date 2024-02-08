const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const User = require('~/app/models/user')
const { DOCUMENT_NOT_FOUND, FORBIDDEN, UNAUTHORIZED } = require('~/app/consts/errors')
const { expectError } = require('~/test/helpers')
const {
  roles: { TUTOR }
} = require('~/app/consts/auth')
const {
  enums: { STATUS_ENUM }
} = require('~/app/consts/validation')

const testUserAuthentication = require('~/app/utils/testUserAuth')
const createAggregateOptions = require('~/app/utils/users/createAggregateOptions')
const TokenService = require('~/app/services/token')

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

const createAggregateFields = {
  limit: '10',
  skip: '5',
  orderBy: 'name',
  order: 'asc',
  role: 'admin',
  from: '2024-11-12',
  to: '2024-12-12',
  status: ['active', 'inactive']
}

describe('User controller', () => {
  let app, server

  beforeAll(async () => {
    ({ app, server } = await serverInit())
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
        const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

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

        const response = await app
          .get(endpointUrl)
          .query(query)
          .set('Cookie', [`accessToken=${accessToken}`])

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
        const response = await app.get(endpointUrl + user._id).set('Cookie', [`accessToken=${accessToken}`])

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
        const response = await app.get(endpointUrl + nonExistingUserId).set('Cookie', [`accessToken=${accessToken}`])
        expectError(404, DOCUMENT_NOT_FOUND([User.modelName]), response)
      })
    })

    describe(`UPDATE ${endpointUrl}:id`, () => {
      it('should UPDATE USER PROFILE by his ID', async () => {
        const { id: currentUserId } = TokenService.validateAccessToken(accessToken)

        const response = await app
          .patch(endpointUrl + currentUserId)
          .send(updateUserData)
          .set('Cookie', [`accessToken=${accessToken}`])

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
          .set('Cookie', [`accessToken=${accessToken}`])

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
          .set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(204)
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app
          .patch(endpointUrl + nonExistingUserId + changeStatusPath)
          .send(mockedStatus)
          .set('Cookie', [`accessToken=${accessToken}`])

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
          .patch(endpointUrl + userWithNoPermissions.id + changeStatusPath)
          .send(mockedStatus)
          .set('Cookie', [`accessToken=${noPermissionsAccessToken}`])

        expectError(403, FORBIDDEN, response)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.patch(endpointUrl + currentUser._id + changeStatusPath).send(mockedStatus)

        expectError(401, UNAUTHORIZED, response)
      })
    })

    describe(`DELETE ${endpointUrl}:id`, () => {
      it('should DELETE user by ID', async () => {
        const response = await app.delete(endpointUrl + currentUser.id).set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(204)
      })

      it('should throw DOCUMENT_NOT_FOUND', async () => {
        const response = await app.delete(endpointUrl + nonExistingUserId).set('Cookie', [`accessToken=${accessToken}`])

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
          .set('Cookie', [`accessToken=${noPermissionsAccessToken}`])

        expectError(403, FORBIDDEN, response)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.delete(endpointUrl + testUser._id)

        expectError(401, UNAUTHORIZED, response)
      })
    })

    describe('createAggregateOptions block', () => {
      it('should handle boolean isFirstLogin field', () => {
        const optionsTrue = createAggregateOptions({ isFirstLogin: 'true' }).match.isFirstLogin.$in
        expect(optionsTrue).toEqual([true])

        const optionsFalse = createAggregateOptions({ isFirstLogin: 'false' }).match.isFirstLogin.$in
        expect(optionsFalse).toEqual([false])
      })

      it('should handle limit and skip fields', () => {
        const options = createAggregateOptions({
          limit: createAggregateFields.limit,
          skip: createAggregateFields.skip
        })

        expect(options.limit).toEqual(parseInt(createAggregateFields.limit))
        expect(options.skip).toEqual(parseInt(createAggregateFields.skip))
      })

      it('should handle sort by name correct', () => {
        const options = createAggregateOptions({
          sort: {
            orderBy: createAggregateFields.orderBy,
            order: createAggregateFields.order
          }
        }).sort

        expect(options).toEqual({ firstName: 1, lastName: 1 })
      })

      it('should include role in match object when role is provided', () => {
        const options = createAggregateOptions({
          role: createAggregateFields.role
        }).match

        expect(options.role).toEqual(createAggregateFields.role)
      })

      it('should include both conditions when dates are provided', () => {
        const options = createAggregateOptions({
          lastLogin: {
            from: createAggregateFields.from,
            to: createAggregateFields.to
          }
        }).match.lastLogin

        expect(options.$gte).toEqual(new Date(createAggregateFields.from))
        expect(options.$lte).toEqual(new Date(new Date(createAggregateFields.to).setHours(23, 59, 59)))
      })

      it('should handle status when the role is provided', () => {
        const options = createAggregateOptions({
          status: createAggregateFields.status,
          role: createAggregateFields.role
        }).match['status.' + createAggregateFields.role]

        expect(options).toEqual({ $in: createAggregateFields.status })
      })

      it('should handle mixed array with boolean strings', () => {
        const options = createAggregateOptions({
          isFirstLogin: ['true', 'false']
        }).match.isFirstLogin.$in

        expect(options).toEqual([true, false])
      })
    })
  })
})
