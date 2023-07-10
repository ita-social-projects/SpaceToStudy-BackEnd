const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const uploadService = require('~/services/upload')

const Lesson = require('~/models/lesson')

const endpointUrl = '/lessons/'

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

describe('Lesson controller', () => {
  let app, server, accessToken, testLessonResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: 'tutor' })

    uploadService.uploadFile = mockUploadFile

    testLessonResponse = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testLesson)
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
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete subject by ID', async () => {
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
})
