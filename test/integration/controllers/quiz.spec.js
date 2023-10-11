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
  category: '6502ec2060ec37be943353e2',
  items: ['64faf47143a2ad4339ec6f5a']
}

const updateData = {
  title: 'WebAssembly'
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
  let app, server, accessToken, currentUser, studentAccessToken, testQuiz, testQuizId

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)

    currentUser = TokenService.validateAccessToken(accessToken)

    testQuiz = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testQuizData)
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
        category: testQuizData.category,
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
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send(testQuizData)

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
            category: testQuizData.category,
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

  describe(`GET ${endpointUrl}:id`, () => {
    it('should get quiz by id', async () => {
      const response = await app.get(endpointUrl + testQuizId).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        _id: expect.any(String),
        author: currentUser.id,
        category: testQuizData.category,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ...testQuizData
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

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update a quiz', async () => {
      await app
        .patch(endpointUrl + testQuizId)
        .send(updateData)
        .set('Authorization', `Bearer ${accessToken}`)

      const quizResponse = await app.get(endpointUrl + testQuizId).set('Authorization', `Bearer ${accessToken}`)

      expect(quizResponse.body).toMatchObject({
        ...testQuizData,
        ...updateData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl + testQuizId).send(updateData)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl + testQuizId)
        .send(updateData)
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })
})
