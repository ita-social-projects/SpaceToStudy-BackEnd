const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED } = require('~/consts/errors')

const endpointUrl = '/messages/'
// const nonExistingCategoryId = '63bed9ef260f18d04ab15da2'

let accessToken
let messageData

let messageBody = {
  author: '6421d9833cdf38b706756dff',
  authorRole: 'tutor',
  text: 'SOme amount of text',
  isRead: false,
  isNotified: false,
  chat: '6421d9833cdf38b706756dfd'
}

describe('Message controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl).send(messageBody)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a new message', async () => {
      const testMessage = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(messageBody)

      expect(testMessage.statusCode).toBe(201)

      messageData = {
        _id: expect.any(String),
        author: expect.any(String),
        authorRole: 'tutor',
        text: 'SOme amount of text',
        isRead: false,
        isNotified: false,
        chat: expect.any(String),
        updatedAt: expect.any(String),
        createdAt: expect.any(String)
      }

      expect(testMessage._body).toEqual(expect.objectContaining(messageData))
    })
  })
})
