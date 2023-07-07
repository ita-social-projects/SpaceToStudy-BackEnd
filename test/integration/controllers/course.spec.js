const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const testUserAuthentication = require('~/utils/testUserAuth')
const Course = require('~/models/course')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND, FORBIDDEN } = require('~/consts/errors')
const TokenService = require('~/services/token')
const endpointUrl = '/courses/'

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
  attachments: ['http://link.com/file1'],
  lessons: []
}

const updateData = {
  title: 'new title',
  description: 'new description'
}

describe('Course controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testCourse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app, tutorUser)
    studentAccessToken = await testUserAuthentication(app)
    
    currentUser = TokenService.validateAccessToken(accessToken)
    
    testCourse = await Course.create({
      ...testCourseData,
      author: currentUser.id
    })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
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
})
