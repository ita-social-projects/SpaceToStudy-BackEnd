const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')

const endpointUrl = '/lessons/'

const testLesson = {
  title: 'title',
  description: 'description',
  attachments: ['test attachment 1', 'test attachment 2']
}

describe('Lesson controller', () => {
  let app, server, accessToken, testLessonResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: 'tutor' })

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
      expect(testLessonResponse.body).toMatchObject(testLesson)
    })
  })
})
