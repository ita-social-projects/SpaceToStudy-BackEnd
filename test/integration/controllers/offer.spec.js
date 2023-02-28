const { serverCleanup, serverInit } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { OFFER_NOT_FOUND } = require('~/consts/errors')
const tokenService = require('~/services/token')

const endpointUrl = '/offers/'
const nonExistingOfferId = '6329a45601bd35b5fff1cf8c'

let testOffer, accessToken

const testUser = {
  role: 'tutor',
  firstName: 'Tart',
  lastName: 'Dilling',
  email: 'test@gmail.com',
  password: 'Superpass123@'
}

describe('Offer controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`test POST ${endpointUrl}`, () => {
    it('should create new offer', async () => {
      const createUserResponse = await app.post('/auth/signup').send(testUser)
      testUser._id = createUserResponse.body.userId
      const findConfirmTokenResponse = await tokenService.findTokensWithUsersByParams({ user: testUser._id })
      const confirmToken = findConfirmTokenResponse[0].confirmToken
      await app.get(`/auth/confirm-email/${confirmToken}`)

      const loginUserResponse = await app
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
      accessToken = loginUserResponse.body.accessToken

      const response = await app
        .post(endpointUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          price: 330,
          proficiencyLevel: 'Beginner',
          description: 'TEST 123ASD',
          languages: ['Ukrainian'],
          subjectId: '63da8767c9ad4c9a0b0eacd3',
          categoryId: '63525e23bf163f5ea609ff2b',
          isActive: false
        })

      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          price: expect.any(Number),
          proficiencyLevel: expect.any(String),
          description: expect.any(String),
          languages: expect.any(Array),
          authorRole: expect.any(String),
          userId: expect.any(String),
          subjectId: expect.any(String),
          categoryId: expect.any(String),
          isActive: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          __v: expect.anything()
        })
      )

      testOffer = response.body
    })
  })

  describe(`test GET ${endpointUrl}`, () => {
    it('should GET all offers', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          price: expect.any(Number),
          proficiencyLevel: expect.any(String),
          description: expect.any(String),
          languages: expect.any(Array),
          authorRole: expect.any(String),
          userId: expect.any(String),
          subjectId: expect.any(String),
          categoryId: expect.any(String)
        })
      )
    })
  })

  describe(`test GET ${endpointUrl}:id`, () => {
    it('should get an offer by ID', async () => {
      const response = await app.get(endpointUrl + testOffer._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
    })

    it('should throw OFFER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, OFFER_NOT_FOUND, response)
    })
  })

  describe(`test UPDATE ${endpointUrl}:id`, () => {
    it('should update offer by ID', async () => {
      const response = await app
        .patch(endpointUrl + testOffer._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ price: 555 })

      expect(response.statusCode).toBe(204)
    })

    it('should throw OFFER_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingOfferId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ price: 555 })

      expectError(404, OFFER_NOT_FOUND, response)
    })
  })

  describe(`test DELETE ${endpointUrl}:id`, () => {
    it('should delete offer by ID', async () => {
      const response = await app.delete(endpointUrl + testOffer._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw OFFER_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, OFFER_NOT_FOUND, response)
    })
  })
})
