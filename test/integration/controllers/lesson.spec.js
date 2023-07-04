const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')

const endpointUrl = '/lessons'

let mockUploadFile = jest.fn().mockResolvedValue('mocked-file-url')

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

    const uploadService = require('~/services/upload')
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
})
