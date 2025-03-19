const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const errors = require('~/consts/errors')
const emailSubject = require('~/consts/emailSubject')

describe('Email controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('Send email endpoint', () => {
    it('should send email', async () => {
      const response = await app
        .post('/send-email')
        .send({ email: 'test@gmail.com', subject: emailSubject.EMAIL_CONFIRMATION })

      expect(response.statusCode).toBe(204)
    })
    it('should throw TEMPLATE_NOT_FOUND error', async () => {
      const response = await app.post('/send-email').send({ email: 'test@gmail.com', subject: 'incorrect template' })

      expectError(404, errors.TEMPLATE_NOT_FOUND, response)
    })
  })
})
