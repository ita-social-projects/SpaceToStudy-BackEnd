const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const Chat = require('~/app/models/chat')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')

const endpointUrl = (id) => `/chats/${id}/messages/`

const chatEndpointUrl = '/chats'

const nonExistingChatId = '64a54c0db1948d5b9d29314a'

let messageBody = {
  text: 'SOme amount of text',
  isRead: false,
  isNotified: false
}

let messageData = {
  _id: expect.any(String),
  text: messageBody.text,
  isRead: false,
  chat: expect.any(String),
  updatedAt: expect.any(String),
  createdAt: expect.any(String)
}

let chatBody = {
  member: '6421d9833cdf38b706756dff',
  memberRole: 'student'
}

let clearedStatusBody = {
  messagesMarkedAsDeleted: expect.any(Number),
  messagesDeleted: expect.any(Number)
}

let userData = {
  role: ['tutor'],
  firstName: 'test',
  lastName: 'user',
  email: 'user@gmail.com',
  password: 'super@123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON()
}

const searchText = 'Some amount of text'

describe('Message controller', () => {
  let app, server, chatResponse, accessToken

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app)

    chatResponse = await app
      .post(chatEndpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(chatBody)
    messageBody.chat = chatResponse.body._id

    await app
      .post(endpointUrl(messageBody.chat))
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(messageBody)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl(messageBody.chat)}`, () => {
    it('should create a new message', async () => {
      const response = await app
        .post(endpointUrl(messageBody.chat))
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(messageBody)

      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual(expect.objectContaining(messageData))
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl(messageBody.chat)).send(messageBody)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get all messages related to a chat', async () => {
      const response = await app.get(endpointUrl(messageBody.chat)).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body[0]).toEqual(expect.objectContaining(messageData))
    })

    it('should get messages matching the text query', async () => {
      const response = await app
        .get(endpointUrl(messageBody.chat))
        .set('Cookie', [`accessToken=${accessToken}`])
        .query({ message: searchText })

      expect(response.statusCode).toBe(200)
      expect(response.body[0]).toEqual(expect.objectContaining(messageData))
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl(messageBody.chat))

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const accessTokenForbidden = await testUserAuthentication(app, userData)

      const response = await app
        .get(endpointUrl(messageBody.chat))
        .set('Cookie', [`accessToken=${accessTokenForbidden}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for chat', async () => {
      const response = await app.get(endpointUrl(nonExistingChatId)).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Chat.modelName]), response)
    })
  })

  describe(`DELETE ${endpointUrl}`, () => {
    it('should delete all messages related to a chat', async () => {
      const response = await app.delete(endpointUrl(messageBody.chat)).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl(messageBody.chat))

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const accessTokenForbidden = await testUserAuthentication(app, userData)

      const response = await app
        .delete(endpointUrl(messageBody.chat))
        .set('Cookie', [`accessToken=${accessTokenForbidden}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for chat', async () => {
      const response = await app.delete(endpointUrl(nonExistingChatId)).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Chat.modelName]), response)
    })
  })

  describe(`PATCH ${endpointUrl}`, () => {
    it('should clear chat history for current user', async () => {
      const response = await app.patch(endpointUrl(messageBody.chat)).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(clearedStatusBody)
    })

    it('should throw NOT MODIFIED if there is nothing to clear', async () => {
      chatResponse = await app
        .post(chatEndpointUrl)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(chatBody)
      messageBody.chat = chatResponse.body._id
      const response = await app.patch(endpointUrl(messageBody.chat)).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(304)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl(messageBody.chat))

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const accessTokenForbidden = await testUserAuthentication(app, userData)

      const response = await app
        .patch(endpointUrl(messageBody.chat))
        .set('Cookie', [`accessToken=${accessTokenForbidden}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for chat', async () => {
      const response = await app.patch(endpointUrl(nonExistingChatId)).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Chat.modelName]), response)
    })
  })
})
