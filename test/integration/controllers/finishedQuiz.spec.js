const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')

const Quiz = require('~/models/quiz')

const testUserAuthentication = require('~/utils/testUserAuth')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const TokenService = require('~/services/token')

const endpointUrl = '/finished-quizzes/'
const nonExistingQuiz = '64cf8a3d40135fba5a0c8fa2'

const testFinishedQuizData = {
  grade: 100,
  results: [
    {
      question: 'Is it the best programming language?',
      answers: [
        {
          text: 'Yes',
          isCorrect: true,
          isChosen: false
        },
        {
          text: 'Yes, of course',
          isCorrect: false,
          isChosen: true
        }
      ]
    }
  ]
}

const testQuizData = {
  title: 'Assembly',
  description: 'Description',
  category: '6502ec2060ec37be943353e2',
  items: ['6527ed6c14c6b72f36962364']
}

describe('Quiz controller', () => {
  let app, server, accessToken, currentUser, testFinishedQuiz, testQuiz

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuiz = await Quiz.create({
      author: currentUser.id,
      ...testQuizData
    })

    testFinishedQuiz = await app
      .post(endpointUrl)
      .send({ quiz: testQuiz._id, ...testFinishedQuizData })
      .set('Cookie', [`accessToken=${accessToken}`])
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a new finished quiz', async () => {
      expect(testFinishedQuiz.statusCode).toBe(201)
      expect(testFinishedQuiz._body).toMatchObject({
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        quiz: testQuiz._id,
        ...testFinishedQuizData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for quiz', async () => {
      const response = await app
        .post(endpointUrl)
        .send({
          ...testFinishedQuizData,
          quiz: nonExistingQuiz
        })
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Quiz.modelName]), response)
    })
  })
})
