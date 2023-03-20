const { serverInit, serverCleanup } = require('~/test/setup')
const User = require('~/models/user')
const { USER_NOT_FOUND } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')

const endpointUrl = '/users/'

let testUser = {
  role: ['student'],
  firstName: 'john',
  lastName: 'doe',
  email: 'johndoe@gmail.com',
  password: 'supersecretpass'
}

const testUserForDeleting = testUser

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

  describe(`POST ${endpointUrl}delete`, () => {
    it('should DELETE users by IDs', async () => {
      const emails = ['harry@gmail.com', 'hermione@gmail.com' ]
      const users =  emails.map( async email => await User.create({ ...testUserForDeleting, email }))

      const usersIds = users.map(user => user._id)
      
      const response = await app.post(endpointUrl + 'delete').send(usersIds)

      expect(response.status).toBe(204)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should DELETE user by ID', async () => {
      
      const response = await app.delete(endpointUrl + testUser._id)

      expect(response.status).toBe(204)
    })

    it('should throw USER_NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingUserId)

      expectError(404, USER_NOT_FOUND, response)
    })
  })
})
