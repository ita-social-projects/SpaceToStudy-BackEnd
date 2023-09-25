const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const ResourceCategory = require('~/models/resourcesCategory')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const { updateResourceCategory } = require('~/services/resourcesCategory')

const endpointUrl = '/resources-categories/'

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

const updateResourceCategoryData = {
  name: 'Computer Science'
}

describe('ResourceCategory controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testResourceCategory

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)

    currentUser = TokenService.validateAccessToken(accessToken)

    testResourceCategory = await ResourceCategory.create({ ...testResourceCategoryData, author: currentUser.id })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`PATCH ${endpointUrl}`, () => {
    it('should update resource category', async () => {
      const response = await app
        .patch(endpointUrl)
        .send(updateResourceCategoryData)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .send(updateResourceCategoryData)
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })
})
