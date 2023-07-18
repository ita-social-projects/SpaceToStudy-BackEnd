const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED } = require('~/consts/errors')

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
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
}

describe('Chat controller', () => {
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
      const response = await app.post(endpointUrl).send(chatBody)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a new chat', async () => {
      const newChat = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(chatBody)

      expect(newChat.statusCode).toBe(201)

      expect(newChat._body).toEqual(expect.objectContaining(chatData))
    })
  })
})
