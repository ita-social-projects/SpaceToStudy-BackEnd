const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')
const {
  enums: { NOTIFICATION_TYPE_ENUM }
} = require('~/app/consts/validation')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const Notification = require('~/app/models/notification')
const TokenService = require('~/app/services/token')

const endpointUrl = '/notifications/'

const nonExistingNotificationId = '64afccc190854916620410f0'

const testNotificationData = {
  reference: '64a7a87aa763d20640038a13',
  referenceModel: 'Review'
}

describe('Notification controller', () => {
  let app, server, accessToken, currentUser, testNotification

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app)

    currentUser = TokenService.validateAccessToken(accessToken)

    testNotification = await Notification.create({
      user: currentUser.id,
      userRole: currentUser.role,
      type: NOTIFICATION_TYPE_ENUM[0],
      ...testNotificationData
    })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get user`s notifications and count them', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body.count).toBe(1)
      expect(response.body.items[0]).toMatchObject({
        _id: testNotification._id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ...testNotificationData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`DELETE ${endpointUrl}`, () => {
    it('should clear all user`s notifications', async () => {
      const response = await app.delete(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      const notifications = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
      expect(notifications.body.count).toBe(0)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete notification by id', async () => {
      const response = await app
        .delete(endpointUrl + testNotification._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)

      const deletedNotification = await Notification.findById(testNotification._id)

      expect(deletedNotification).toBe(null)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl + testNotification._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .delete(endpointUrl + nonExistingNotificationId)
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Notification.modelName]), response)
    })
  })
})
