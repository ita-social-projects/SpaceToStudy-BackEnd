const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

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

    testQuestion = await app.post(endpointUrl).send(testQuestionData).set('Authorization', `Bearer ${accessToken}`)
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
      const questions = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

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
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update a question', async () => {
      await app
        .patch(endpointUrl + testQuestionId)
        .send(updateData)
        .set('Authorization', `Bearer ${accessToken}`)

      const questionResponse = await app.get(endpointUrl + testQuestionId).set('Authorization', `Bearer ${accessToken}`)

      expect(questionResponse.body).toMatchObject({
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
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })
})
