const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const Lesson = require('~/app/models/lesson')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND, FORBIDDEN } = require('~/app/consts/errors')

const endpointUrl = '/lessons/'
const nonExistingLessonId = '64a51e41de4debbccf0b39b0'

const testLesson = {
  title: 'title',
  description: 'description',
  category: '6502ec2060ec37be943353e2',
  content: '<h1>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</h1>',
  attachments: ['65bed8ef260f18d04ab22da3', '65bed9ef260f19d05ab25bc6']
}

let tutorUser = {
  role: 'tutor',
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  FAQ: { student: [{ question: 'question1', answer: 'answer1' }] },
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: 'tutor'
}

const updateData = {
  title: 'updated title',
  description: 'new cool description'
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

describe('Lesson controller', () => {
  let app, server, accessToken, studentAccessToken, testLessonResponse, testLessonId

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, tutorUser)
    studentAccessToken = await testUserAuthentication(app)

    testLessonResponse = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(testLesson)
    testLessonId = testLessonResponse.body._id

    studentAccessToken = await testUserAuthentication(app, studentUserData)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a lesson', async () => {
      expect(testLessonResponse.statusCode).toBe(201)
      expect(testLessonResponse.body).toMatchObject({
        category: testLesson.category,
        title: testLesson.title,
        description: testLesson.description,
        attachments: expect.any(Array)
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      accessToken = await testUserAuthentication(app)

      const response = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${studentAccessToken}`])
        .send(testLesson)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('get all lessons', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ count: 1, items: [expect.any(Object)] }))
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      accessToken = await testUserAuthentication(app)

      const response = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${studentAccessToken}`])
        .send(testLesson)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should throw FORBIDDEN', async () => {
      const response = await app
        .delete(endpointUrl + testLessonResponse.body._id)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
    it('should delete lesson by ID', async () => {
      const response = await app
        .delete(endpointUrl + testLessonResponse.body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingLessonId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Lesson.modelName]), response)
    })
  })

  describe(`PATCH ${endpointUrl}`, () => {
    it('should update a lesson', async () => {
      const response = await app
        .patch(endpointUrl + testLessonId)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateData)
      expect(response.statusCode).toBe(204)

      const updatedLesson = await Lesson.findById(testLessonId)
      expect(updatedLesson).toMatchObject({
        title: 'updated title',
        description: 'new cool description',
        attachments: expect.any(Array)
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.patch(endpointUrl + nonExistingLessonId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Lesson.modelName]), response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .set('Cookie', [`accessToken=${studentAccessToken}`])
        .send(updateData)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('Should get lesson by ID', async () => {
      const response = await app
        .get(endpointUrl + testLessonResponse.body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)

      expect(response.body).toMatchObject({
        _id: expect.any(String),
        author: expect.any(String),
        category: testLesson.category,
        title: testLesson.title,
        description: testLesson.description,
        content: testLesson.content,
        attachments: expect.any(Array),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingLessonId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Lesson.modelName]), response)
    })
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
    it('should throw FORBIDDEN', async () => {
      const response = await app
        .get(endpointUrl + testLessonResponse.body._id)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
