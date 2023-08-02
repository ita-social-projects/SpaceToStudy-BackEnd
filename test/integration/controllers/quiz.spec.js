const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const endpointUrl = '/quizzes/'

const testQuizData = {
  title: 'Assembly',
  items: [
    {
      question: 'Is it the best programming language?',
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
  ]
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

describe('Quiz controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testQuiz

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuiz = await app.post(endpointUrl).send(testQuizData).set('Authorization', `Bearer ${accessToken}`)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a new quiz', async () => {
      expect(testQuiz.statusCode).toBe(201)
      expect(testQuiz._body).toMatchObject({
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        author: currentUser.id,
        ...testQuizData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .post(endpointUrl)
        .send(testQuizData)
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get all quizzes', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body).toEqual({
        items: [
          {
            _id: expect.any(String),
            author: currentUser.id,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            ...testQuizData
          }
        ],
        count: 1
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })
})
