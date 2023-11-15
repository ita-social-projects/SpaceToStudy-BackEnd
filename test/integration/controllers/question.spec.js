const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const Question = require('~/models/question')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const endpointUrl = '/questions/'

const testQuestionData = {
  title: 'Assembly',
  text: 'What is Assembly',
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

const updateData = {
  title: 'Here is updated one!',
  type: 'multipleChoice'
}

describe('Question controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testQuestion, testQuestionId

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuestion = await app
      .post(endpointUrl)
      .send(testQuestionData)
      .set('Cookie', [`accessToken=${accessToken}`])
    testQuestionId = testQuestion.body._id
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should return list of questions', async () => {
      const questions = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(questions.statusCode).toBe(200)
      expect(questions.body.count).toBe(1)
      expect(questions.body.items).toMatchObject([
        {
          _id: testQuestion.body._id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          ...testQuestionData
        }
      ])
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
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update a question', async () => {
      const response = await app
        .patch(endpointUrl + testQuestionId)
        .send(updateData)
        .set('Cookie', [`accessToken=${accessToken}`])
      expect(response.statusCode).toBe(200)

      const updatedQuestion = await Question.findById(testQuestionId)

      expect(updatedQuestion).toMatchObject({
        ...testQuestionData,
        ...updateData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl + testQuestionId).send(updateData)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl + testQuestionId)
        .send(updateData)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
