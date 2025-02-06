const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')

const Quiz = require('~/models/quiz')

const testUserAuthentication = require('~/utils/testUserAuth')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const {
  roles: { TUTOR, STUDENT }
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
  items: ['6527ed6c14c6b72f36962364'],
  settings: {
    timeLimit: '15 minutes'
  }
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
  }),
    describe(`GET ${endpointUrl}`, () => {
      it('should get all finished quizzes', async () => {
        const response = await app.get(`${endpointUrl}`).set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.body.items)).toBe(true)
        expect(response.body).toEqual({
          items: [
            {
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              quiz: String(testQuiz._id),
              ...testFinishedQuizData
            }
          ],
          count: 1
        })
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.get(endpointUrl)

        expectError(401, UNAUTHORIZED, response)
      })
    }),
    describe(`GET ${endpointUrl}:id`, () => {
      it('should get finished quiz', async () => {
        const finishedQuizId = testFinishedQuiz._body._id

        const response = await app.get(endpointUrl + finishedQuizId).set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          quiz: String(testQuiz._id),
          ...testFinishedQuizData
        })
      })

      it('should throw UNAUTHORIZED', async () => {
        const finishedQuizId = testFinishedQuiz._body._id

        const response = await app.get(endpointUrl + finishedQuizId)

        expectError(401, UNAUTHORIZED, response)
      })
    }),
    describe(`PATCH ${endpointUrl}:id`, () => {
      it('should update finished quiz', async () => {
        const finishedQuizId = testFinishedQuiz._body._id

        const response = await app
          .patch(endpointUrl + finishedQuizId)
          .send({ grade: 88 })
          .set('Cookie', [`accessToken=${accessToken}`])

        const updatedFinishedQuiz = await app
          .get(endpointUrl + finishedQuizId)
          .set('Cookie', [`accessToken=${accessToken}`])

        expect(response.statusCode).toBe(204)
        expect(updatedFinishedQuiz._body.grade).toEqual(88)
      })

      it('should throw UNAUTHORIZED', async () => {
        const response = await app.patch(endpointUrl)

        expectError(401, UNAUTHORIZED, response)
      })
    })
})

describe('Finished quiz controller for student', () => {
  let app, server, accessToken, currentUser, testQuiz

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: STUDENT })

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuiz = await Quiz.create({
      author: currentUser.id,
      ...testQuizData
    })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should throw QUIZ_TIME_LIMIT_EXCEEDED when time limit exceeded', async () => {
      const testFinishedQuiz = await app
        .post(endpointUrl)
        .send({ quiz: testQuiz._id, ...testFinishedQuizData })
        .set('Cookie', [`accessToken=${accessToken}`])
      const finishedQuizId = testFinishedQuiz._body._id

      const createdAt = new Date(testFinishedQuiz._body.createdAt).getTime()
      const timeLimitInMilliseconds = 15 * 60 * 1000
      const timePassed = timeLimitInMilliseconds + 1
      jest.spyOn(Date, 'now').mockImplementation(() => createdAt + timePassed)

      const response = await app
        .patch(endpointUrl + finishedQuizId)
        .send({ grade: 88 })
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(403)
    })
  })
})
