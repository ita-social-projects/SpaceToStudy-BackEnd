const { serverInit, serverCleanup, stopServer } = require('~/test/setup')

const emails = ['test1@gmail.com', 'test2@gmail.com']
const endpointURL = '/admin-invitations'

describe('Admin invitation controller', () => {
  let app, server, response
  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    response = await app.post(endpointURL).send({ emails }).set('Accept-Language', 'en')
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('admin-invitations endpoint', () => {
    describe(`POST ${endpointURL}`, () => {
      it('should send admin invitations', async () => {
        expect(response.statusCode).toBe(201)

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ email: emails[0] }),
            expect.objectContaining({ email: emails[1] })
          ])
        )
      })
    })

    describe(`GET ${endpointURL}`, () => {
      it('should get admin invitations', async () => {
        const { body, statusCode } = await app.get(endpointURL)

        expect(statusCode).toBe(200)

        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ email: emails[0] }),
            expect.objectContaining({ email: emails[1] })
          ])
        )
      })
    })
  })
})
