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
  proficiencyLevel: ['Advanced'],
  sections: [
    {
      title: 'Section First',
      description: 'description',
      lessons: [],
      quizzes: [],
      attachments: []
    }
  ]
}

const updateData = {
  title: 'new title',
  description: 'new description'
}

const categoryBody = {
  name: 'Languages1',
  appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
}

const subjectBody = { name: 'English' }

describe('Course controller', () => {
  let app, server, accessToken, studentAccessToken, testCourseResponse, testCourse, testCategory, testSubject

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app, tutorUser)
    studentAccessToken = await testUserAuthentication(app)

    uploadService.uploadFile = mockUploadFile

    testCategory = await app
      .post('/categories/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(categoryBody)

    subjectBody.category = testCategory.body._id
    testCourseData.category = testCategory.body._id

    testSubject = await app
      .post('/subjects/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(subjectBody)

    testCourseData.subject = testSubject.body._id

    testCourseResponse = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(testCourseData)
    testCourse = testCourseResponse.body
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a course', async () => {
      expect(testCourseResponse.statusCode).toBe(201)
      expect(testCourseResponse.body).toMatchObject({
        title: testCourseData.title,
        description: testCourseData.description,
        category: testCategory.body._id,
        subject: testSubject.body._id,
        proficiencyLevel: testCourseData.proficiencyLevel,
        sections: expect.any(Array)
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .set('Cookie', [`accessToken=${studentAccessToken}`])
        .send(testCourseData)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get all courses', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        count: 1,
        items: [
          expect.objectContaining({
            ...testCourse,
            category: { _id: testCategory.body._id, appearance: testCategory.body.appearance },
            subject: { _id: testSubject.body._id, name: testSubject.body.name }
          })
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
    it('should update a course', async () => {
      const response = await app
        .patch(endpointUrl + testCourse._id)
        .set('Cookie', [`accessToken=${accessToken}`])
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
      const response = await app.patch(endpointUrl + nonExistingCourseId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Course.modelName]), response)
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
    it('should get course by id', async () => {
      const response = await app
        .get(endpointUrl + testCourseResponse.body._id)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        _id: expect.any(String),
        author: expect.any(String),
        title: 'assembly',
        description: 'you will learn some modern programming language for all your needs',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingCourseId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Course.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete a course', async () => {
      const response = await app.delete(endpointUrl + testCourse._id).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingCourseId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Course.modelName]), response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app.delete(endpointUrl).set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
