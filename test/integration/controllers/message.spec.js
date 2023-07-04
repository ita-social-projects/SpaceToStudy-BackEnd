const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED } = require('~/consts/errors')
const Chat = require('~/models/chat')

async function chatData() {
  const data = await Chat.create({
    members: [
      { user: '6491d003a634c3c427b69daa', role: 'tutor' },
      { user: '6491d003a634c3c427b69da5', role: 'student' }
    ]
  })
  const chat = data.toJSON()
  return chat
}

const endpointUrl = '/messages/'

let accessToken

let messageBody = {
  text: 'SOme amount of text',
  isRead: false,
  isNotified: false
}

let messageData = {
  _id: expect.any(String),
  text: 'SOme amount of text',
  isRead: false,
  isNotified: false,
  chat: expect.any(String),
  updatedAt: expect.any(String),
  createdAt: expect.any(String)
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
      const chatMock = await chatData()
      messageBody.chat = await chatMock._id

      const testMessage = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(messageBody)

      expect(testMessage.statusCode).toBe(201)

      expect(testMessage._body).toEqual(expect.objectContaining(messageData))
    })
  })
})
