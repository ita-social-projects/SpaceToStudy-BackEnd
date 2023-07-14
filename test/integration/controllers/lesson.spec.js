const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const Lesson = require('~/models/lesson')
const uploadService = require('~/services/upload')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND, FORBIDDEN } = require('~/consts/errors')


const endpointUrl = '/lessons/'
const nonExistingLessonId = '64a51e41de4debbccf0b39b0'

let mockUploadFile = jest.fn().mockResolvedValue('mocked-file-url')

const nonExistingID = '64a33e71eea95284f397a6e4'

const testLesson = {
  title: 'title',
  description: 'description',
  attachments: [
    {
      src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example1.jpg'
    },
    {
      src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example2.jpg'
    }
  ]
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
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, tutorUser)
    studentAccessToken = await testUserAuthentication(app)

    uploadService.uploadFile = mockUploadFile

    testLessonResponse = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testLesson)
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
        title: 'title',
        description: 'description',
        attachments: ['mocked-file-url', 'mocked-file-url']
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      accessToken = await testUserAuthentication(app)

      const response = await app.post(endpointUrl).set('Authorization', `Bearer ${studentAccessToken}`).send(testLesson)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('get all lessons', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ count: 1, items: [expect.any(Object)] }))
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      accessToken = await testUserAuthentication(app)

      const response = await app.post(endpointUrl).set('Authorization', `Bearer ${studentAccessToken}`).send(testLesson)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should throw FORBIDDEN', async () => {
      const response = await app
        .delete(endpointUrl + testLessonResponse.body._id)
        .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })
    it('should delete lesson by ID', async () => {
      const response = await app
        .delete(endpointUrl + testLessonResponse.body._id)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingID).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Lesson.modelName]), response)
    })
  })

  describe(`PATCH ${endpointUrl}`, () => {
    it('should update a lesson', async () => {
      const response = await app
        .patch(endpointUrl + testLessonId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
      expect(response.statusCode).toBe(204)

      const updatedLesson = await Lesson.findById(testLessonId)
      expect(updatedLesson).toMatchObject({
        title: 'updated title',
        description: 'new cool description',
        attachments: ['mocked-file-url', 'mocked-file-url']
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.patch(endpointUrl + nonExistingLessonId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Lesson.modelName]), response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send(updateData)

      expectError(403, FORBIDDEN, response)
    })
  })
})
