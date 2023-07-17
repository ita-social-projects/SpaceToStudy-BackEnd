const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const testUserAuthentication = require('~/utils/testUserAuth')
const Course = require('~/models/course')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND, FORBIDDEN } = require('~/consts/errors')
const uploadService = require('~/services/upload')

const endpointUrl = '/courses/'

let mockUploadFile = jest.fn().mockResolvedValue('mocked-file-url')

const nonExistingCourseId = '64a51e41de4debbccf0b39b0'

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

const testCourseData = {
  title: 'assembly',
  description: 'you will learn some modern programming language for all your needs',
  attachments: [
    {
      src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example1.jpg'
    }
  ],
  lessons: []
}

const updateData = {
  title: 'new title',
  description: 'new description'
}

describe('Course controller', () => {
  let app, server, accessToken, studentAccessToken, testCourseResponse, testCourse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app, tutorUser)
    studentAccessToken = await testUserAuthentication(app)

    currentUser = TokenService.validateAccessToken(accessToken)

    uploadService.uploadFile = mockUploadFile

    testCourseResponse = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testCourseData)
    testCourse = testCourseResponse.body
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get all courses', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      const { title, description, attachments } = await Course.findById(testCourse._id)

      expect(response.statusCode).toBe(200)
      expect({ title, description, attachments }).toMatchObject({
        title: 'assembly',
        description: 'you will learn some modern programming language for all your needs',
        attachments: ['mocked-file-url']
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

  describe(`POST ${endpointUrl}`, () => {
    it('should create a course', async () => {
      expect(testCourseResponse.statusCode).toBe(201)
      expect(testCourseResponse.body).toMatchObject({
        title: testCourseData.title,
        description: testCourseData.description,
        attachments: ['mocked-file-url']
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send(testCourseData)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update a course', async () => {
      const response = await app
        .patch(endpointUrl + testCourse._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      const { title, description } = await Course.findById(testCourse._id)

      expect(response.statusCode).toBe(204)
      expect({ title, description }).toMatchObject(updateData)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.patch(endpointUrl + nonExistingCourseId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Course.modelName]), response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send(updateData)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should get course by id', async () => {
      const response = await app
        .get(endpointUrl + testCourseResponse.body._id)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        _id: expect.any(String),
        author: expect.any(String),
        title: 'assembly',
        description: 'you will learn some modern programming language for all your needs',
        attachments: ['mocked-file-url'],
        lessons: expect.any(Array),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingCourseId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Course.modelName]), response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
      .get(endpointUrl + testCourseResponse.body._id)
      .set('Authorization', `Bearer ${studentAccessToken}`)

      expectError(403, FORBIDDEN, response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })
})
