const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Notification = require('~/models/notification')
const TokenService = require('~/services/token')

const endpointUrl = '/notifications/'

const testNotificationData = {
  reference: '64a7a87aa763d20640038a13',
  referenceModel: 'Review'
}

describe('Notification controller', () => {
  let app, server, accessToken, currentUser, testNotification

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach( async () => {
    accessToken = await testUserAuthentication(app)

    currentUser = TokenService.validateAccessToken(accessToken)

    testNotification = await Notification.create({
      user: currentUser.id,
      userRole: currentUser.role,
      type:'review',
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
    it('should get user\'s notifications and count them', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body.count).toBe(1)
      expect(response.body.items[0]).toMatchObject({
        _id:testNotification._id,
        createdAt:expect.any(String),
        updatedAt:expect.any(String),
        ...testNotificationData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)
  
      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`DELETE ${endpointUrl}`, () => {
    it('should clear all user\'s notifications', async () => {
      const response = await app.delete(endpointUrl).set('Authorization', `Bearer ${accessToken}`)
      
      const notifications = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
      expect(notifications.body.count).toBe(0)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)
  
      expectError(401, UNAUTHORIZED, response)
    })
  })
})
