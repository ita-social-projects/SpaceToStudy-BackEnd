const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const Question = require('~/models/question')

const endpointUrl = '/questions/'

const testQuestionData = {
  title: 'Assembly',
  answers: [
    {
      text: 'Yes',
      isCorrect: true
    },
    {
      text: 'Yes, of course',
      isCorrect: false
    }
  ]
}


describe('Question controller', () => {
  let app, server, accessToken, currentUser, testQuestion

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuestion = await Question.create({ author: currentUser.id, ...testQuestionData })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should return list of questions', async () => {
      const questions = await app.get(endpointUrl).set('Authorization', accessToken)

      expect(questions.statusCode).toBe(200)
      expect(questions.count).toBe(1)
      expect(questions.items).toContainObject({
        _id: testQuestion._id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ...testQuestionData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })
})
