const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')
const Chat = require('~/app/models/chat')

const nonExistingChatId = '64a33e71eea95284f397a6e4'
const endpointUrl = '/chats/'

let accessToken

let chatBody = {
  member: '6421d9833cdf38b706756dff',
  memberRole: 'student'
}

let chatData = {
  _id: expect.any(String),
  members: [
    {
      user: expect.any(String),
      role: expect.any(String)
    },
    {
      user: '6421d9833cdf38b706756dff',
      role: 'student'
    }
  ],
  deletedFor: [],
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
}

let markedChatData = {
  _id: expect.any(String),
  members: [
    {
      user: expect.any(String),
      role: expect.any(String)
    },
    {
      user: '6421d9833cdf38b706756dff',
      role: 'student'
    }
  ],
  deletedFor: [
    {
      user: expect.any(String)
    }
  ],
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
}

const differentUserData = {
  role: 'student',
  firstName: 'Student',
  lastName: 'Student',
  email: 'student@gmail.com',
  password: 'studentpass',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: 'student'
}

describe('Chat controller', () => {
  let app, server, testChat, studentAccessToken

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app)
    studentAccessToken = await testUserAuthentication(app, differentUserData)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl).send(chatBody)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a new chat', async () => {
      const newChat = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(chatBody)

      expect(newChat.statusCode).toBe(201)

      expect(newChat._body).toEqual(expect.objectContaining(chatData))
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    beforeEach(async () => {
      testChat = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(chatBody)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .delete(endpointUrl + testChat._body._id)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should delete chat by ID', async () => {
      const response = await app.delete(endpointUrl + testChat._body._id).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingChatId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Chat.modelName]), response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    beforeEach(async () => {
      testChat = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(chatBody)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl + testChat._body._id)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should mark chat by ID as deleted', async () => {
      const response = await app.patch(endpointUrl + testChat._body._id).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response._body).toEqual(expect.objectContaining(markedChatData))
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw NOT_FOUND', async () => {
      const response = await app.patch(endpointUrl + nonExistingChatId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Chat.modelName]), response)
    })
  })
})
