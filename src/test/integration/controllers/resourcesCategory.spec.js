const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')

const {
  roles: { TUTOR }
} = require('~/consts/auth')

const endpointUrl = '/resources-categories/'

const nameEnpointUrl = endpointUrl + 'names'

const testResourceCategoryData = {
  name: 'Chemical Category'
}

const studentUserData = {
  role: 'student',
  firstName: 'Yamada',
  lastName: 'Kizen',
  email: 'yamakai@gmail.com',
  password: 'ninpopass',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: 'student'
}

const tutorUserData = {
  role: TUTOR,
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: TUTOR
}

const updateResourceCategoryData = {
  name: 'Computer Science'
}

const testResourceCategoryResponse = [
  {
    _id: expect.any(String),
    name: testResourceCategoryData.name
  }
]

describe('ResourceCategory controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, tutorAccessToken, testResourceCategory

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)
    tutorAccessToken = await testUserAuthentication(app, tutorUserData)
    currentUser = TokenService.validateAccessToken(accessToken)

    testResourceCategory = await app
      .post(endpointUrl)
      .send(testResourceCategoryData)
      .set('Cookie', [`accessToken=${accessToken}`])
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a new reesource category', async () => {
      expect(testResourceCategory.statusCode).toBe(201)
      expect(testResourceCategory._body).toMatchObject({
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        author: currentUser.id,
        ...testResourceCategoryData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .post(endpointUrl)
        .send(testResourceCategoryData)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update resource category', async () => {
      const response = await app
        .patch(endpointUrl + testResourceCategory.body._id)
        .send(updateResourceCategoryData)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl + testResourceCategory.body._id)
        .send(updateResourceCategoryData)
        .set('Cookie', [`accessToken=${tutorAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get resource categories', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])
      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        items: [
          {
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            ...testResourceCategoryData
          }
        ],
        count: 1
      })
    })

    describe(`GET ${endpointUrl}names`, () => {
      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(endpointUrl)

        expectError(401, UNAUTHORIZED, response)
      })

      it('should get resource categories names', async () => {
        const response = await app.get(nameEnpointUrl).set('Cookie', [`accessToken=${accessToken}`])
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual(testResourceCategoryResponse)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(nameEnpointUrl)

        expectError(401, UNAUTHORIZED, response)
      })
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete resource category', async () => {
      const response = await app
        .delete(endpointUrl + testResourceCategory.body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .delete(endpointUrl + testResourceCategory.body._id)
        .set('Cookie', [`accessToken=${tutorAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
