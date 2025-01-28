const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')

const emails = ['test1@gmail.com', 'test2@gmail.com']

let studentUser = {
  role: ['student'],
  firstName: 'TestStudent',
  lastName: 'StudentTest',
  email: 'teststudent@gmail.com',
  password: 'studentpassword123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  isFirstLogin: false,
  lastLoginAs: 'student'
}

let superadminUser = {
  role: ['superadmin'],
  firstName: 'TestAdmin',
  lastName: 'AdminTest',
  email: 'testadmin@gmail.com',
  password: 'supersecretpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  isFirstLogin: false,
  lastLoginAs: 'superadmin'
}

const endpointURL = '/admin-invitations'

describe('Admin invitation controller', () => {
  let app, server, response, accessToken

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('admin-invitations endpoint', () => {
    describe(`POST ${endpointURL}`, () => {
      it('should throw FORBIDDEN (student user)', async () => {
        accessToken = await testUserAuthentication(app, studentUser)

        response = await app
          .post(endpointURL)
          .send({ emails })
          .set('Accept-Language', 'en')
          .set('Cookie', `accessToken=${accessToken}`)

        expect(response.statusCode).toBe(403)
      })

      it('should send admin invitations (superadmin user)', async () => {
        accessToken = await testUserAuthentication(app, superadminUser)

        response = await app
          .post(endpointURL)
          .send({ emails })
          .set('Accept-Language', 'en')
          .set('Cookie', `accessToken=${accessToken}`)

        expect(response.statusCode).toBe(201)
        expect.arrayContaining([
          expect.objectContaining({ email: emails[0] }),
          expect.objectContaining({ email: emails[1] })
        ])
      })
    })

    describe(`GET ${endpointURL}`, () => {
      it('should get admin invitations (superadmin user)', async () => {
        accessToken = await testUserAuthentication(app, superadminUser)
        await app
          .post(endpointURL)
          .send({ emails })
          .set('Accept-Language', 'en')
          .set('Cookie', `accessToken=${accessToken}`)

        const { statusCode, body } = await app
          .get(endpointURL)
          .set('Accept-Language', 'en')
          .set('Cookie', `accessToken=${accessToken}`)

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
