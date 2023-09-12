const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
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
  ],
  type: 'multipleChoice'
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

describe('Question controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testQuestion

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuestion = await Question.create({ author: currentUser.id, ...testQuestionData })

    studentAccessToken = await testUserAuthentication(app, studentUserData)

    testQuestion = await app.post(endpointUrl).send(testQuestionData).set('Authorization', `Bearer ${accessToken}`)
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

  describe(`POST ${endpointUrl}`, () => {
    it('should create a new question', async () => {
      expect(testQuestion.statusCode).toBe(201)
      expect(testQuestion._body).toMatchObject({
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        author: currentUser.id,
        ...testQuestionData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .post(endpointUrl)
        .send(testQuestionData)
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })
})
