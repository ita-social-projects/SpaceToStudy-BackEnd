const { serverInit, serverCleanup } = require('~/test/setup')
const User = require('~/models/user')
const { USER_NOT_FOUND, FORBIDDEN } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const { roles: { TUTOR, STUDENT } } = require('~/consts/auth')
const { enums: { STATUS_ENUM } } = require('~/consts/validation')
const { createUser } = require('~/services/user')

const endpointUrl = '/users/'

let testUser = {
  role: ['student'],
  firstName: 'john',
  lastName: 'doe',
  email: 'johndoe@gmail.com',
  password: 'supersecretpass'
}
let adminUser = {
  role:'admin',
  firstName:'TestAdmin',
  lastName:'AdminTest',
  email:'testadmin@gmail.com', 
  password:'supersecretpass123',
  appLanguage:'en',
  isEmailConfirmed: true
}

const nonExistingUserId = '6329a8c501bd35b52a5ecf8c'

describe('User controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should GET all users', async () => {
      let user = await User.create(testUser)

      const response = await app.get(endpointUrl)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body.items).toEqual(expect.any(Array))

      testUser = user
    })

    it('should GET all users which match query', async () => {
      const query = {
        email: testUser.email,
        isEmailConfirmed: 'false',
        role: testUser.role[0]
      }

      const response = await app.get(endpointUrl).query(query)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body.items.length).toBe(1)
      expect(response.body.count).toBe(1)
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should GET user by ID', async () => {
      const response = await app.get(endpointUrl + testUser._id)

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        _id: expect.any(String),
        role: expect.any(Array),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.any(String),
        totalReviews: expect.any(Number),
        averageRating: expect.any(Number),
        categories: expect.any(Array),
        isEmailConfirmed: expect.any(Boolean),
        isFirstLogin: expect.any(Boolean),
        bookmarkedOffers: expect.any(Array),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw USER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingUserId)
      expectError(404, USER_NOT_FOUND, response)
    })
  })
  describe(`UPDATE ${endpointUrl}:id`, () => {
    const mockedStatus = { tutor: STATUS_ENUM[0] }

    it('should UPDATE user by ID', async () => {
      await createUser(...Object.values(adminUser))

      const authResponse = await app.post('/auth/login').send({ email: adminUser.email, password: adminUser.password })

      const response = await app
        .patch(endpointUrl + testUser._id)
        .send(mockedStatus)
        .set('Authorization', `Bearer ${authResponse._body.accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw USER_NOT_FOUND', async () => {
      const authResponse = await app.post('/auth/login').send({ email: adminUser.email, password: adminUser.password })

      const response = await app
        .patch(endpointUrl + nonExistingUserId)
        .send(mockedStatus)
        .set('Authorization', `Bearer ${authResponse._body.accessToken}`)

      expectError(404, USER_NOT_FOUND, response)
    })

    it('should throw FORBIDDEN', async () => {
      const userWithNoPermissions = { ...adminUser, role: TUTOR, email: 'testTutor@gmail.com' }
      await createUser(...Object.values(userWithNoPermissions))

      const authResponse = await app
        .post('/auth/login')
        .send({ email: userWithNoPermissions.email, password: adminUser.password })

      const response = await app
        .patch(endpointUrl + testUser._id)
        .send(STATUS_ENUM[0])
        .set('Authorization', `Bearer ${authResponse._body.accessToken}`)

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    let authResponse 
    beforeEach(async () => {
      authResponse = await app.post('/auth/login').send({ email: adminUser.email, password: adminUser.password })
    })
    it('should DELETE user by ID', async () => {
      const response = await app.delete(endpointUrl + testUser._id).set('Authorization', `Bearer ${authResponse._body.accessToken}`)
    
      expect(response.statusCode).toBe(204)
    })

    it('should throw USER_NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingUserId).set('Authorization', `Bearer ${authResponse._body.accessToken}`)

      expectError(404, USER_NOT_FOUND, response)
    })
  })
})
