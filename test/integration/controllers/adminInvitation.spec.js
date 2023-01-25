const { serverInit, serverCleanup } = require('~/test/setup')

const emails = ['test1@gmail.com', 'test2@gmail.com']

describe('Admin invitation controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe('admin-invitations endpoint', () => {
    describe('POST admin-invitations', () => {
      it('should send admin invitations', async () => {
        const response = await app.post('/admin-invitations').send({ emails }).set('Accept-Language', 'en')

        expect(response.statusCode).toBe(201)
        expect(response.body[0].email).toBe(emails[0])
        expect(response.body[1].email).toBe(emails[1])
      })
    })

    describe('GET admin-invitations', () => {
      it('should get admin invitations', async () => {
        const response = await app.get('/admin-invitations')

        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveLength(2)
      })
    })
  })
})
