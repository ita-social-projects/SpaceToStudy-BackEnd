const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const {
  roles: { TUTOR }
} = require('~/consts/auth')
const {
  enums: { QUIZ_VIEW_ENUM, RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

const endpointUrl = '/quizzes/'
const questionEndpointUrl = '/questions/'

const testQuizData = {
  title: 'Assembly',
  description: 'Description',
  resourceType: RESOURCES_TYPES_ENUM[1],
  availability: {
    status: 'open',
    date: null
  },
  settings: {
    correctAnswers: false,
    pointValues: false,
    scoredResponses: false,
    shuffle: false,
    view: QUIZ_VIEW_ENUM[1]
  }
}

const updateData = {
  title: 'WebAssembly'
}

const testQuestionData = {
  title: 'Assembly',
  text: 'What is Assembly',
  answers: [
    { text: 'Yes', isCorrect: true },
    { text: 'Yes, of course', isCorrect: false }
  ],
  category: null,
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

describe('Quiz controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testQuiz, testQuizId, testQuestion, testQuestionId

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuestion = await app
      .post(questionEndpointUrl)
      .send(testQuestionData)
      .set('Cookie', [`accessToken=${accessToken}`])
    testQuestionId = testQuestion._body._id

    testQuiz = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ ...testQuizData, items: [testQuestionId] })
    testQuizId = testQuiz.body._id
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
        .set('Cookie', [`accessToken=${studentAccessToken}`])
        .send(testQuizData)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get all quizzes', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body).toEqual({
        items: [
          {
            _id: expect.any(String),
            author: currentUser.id,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            ...testQuizData,

            category: null,
            items: [testQuestionId]
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
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should get quiz by id', async () => {
      const response = await app.get(endpointUrl + testQuizId).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)

      expect(response.body).toMatchObject({
        _id: expect.any(String),
        author: currentUser.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ...testQuizData,
        items: [
          {
            _id: testQuestionId,
            title: testQuestionData.title,
            text: testQuestionData.text,
            answers: testQuestionData.answers
          }
        ]
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update a quiz', async () => {
      await app
        .patch(endpointUrl + testQuizId)
        .send(updateData)
        .set('Cookie', [`accessToken=${accessToken}`])

      const quizResponse = await app.get(endpointUrl + testQuizId).set('Cookie', [`accessToken=${accessToken}`])

      expect(quizResponse.body).toMatchObject({
        ...testQuizData,
        ...updateData
      })
    })

    it('should update a quiz settings', async () => {
      const updatedSettings = {
        correctAnswers: true,
        pointValues: true,
        scoredResponses: true,
        shuffle: true,
        view: QUIZ_VIEW_ENUM[0]
      }

      await app
        .patch(endpointUrl + testQuizId)
        .send({ settings: updatedSettings })
        .set('Cookie', [`accessToken=${accessToken}`])

      const updatedQuiz = await app.get(endpointUrl + testQuizId).set('Cookie', [`accessToken=${accessToken}`])
      expect(updatedQuiz._body.settings).toEqual(updatedSettings)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl + testQuizId).send(updateData)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl + testQuizId)
        .send(updateData)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete quiz by ID', async () => {
      const response = await app.delete(endpointUrl + testQuizId).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app.delete(endpointUrl + testQuizId).set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
