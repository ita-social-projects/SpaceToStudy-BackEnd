const { serverCleanup, serverInit } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Offer = require('~/models/offer')

const endpointUrl = '/offers/'
const nonExistingOfferId = '6329a45601bd35b5fff1cf8c'

let testOffer = {
  price: 330,
  proficiencyLevel: 'Beginner',
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  subjectId: '63da8767c9ad4c9a0b0eacd3',
  categoryId: '63525e23bf163f5ea609ff2b'
}

let testOffer2 = {
  price: 500,
  proficiencyLevel: 'Beginner',
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  subjectId: '63da8767c9ad4c9a0b0eacd3',
  categoryId: '63525e23bf163f5ea609ff2b'
}

let testOffer3 = {
  price: 250,
  authorRole: 'tutor',
  proficiencyLevel: 'Beginner',
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  subjectId: '63da8767c9ad4c9a0b0eacd3',
  categoryId: '63525e23bf163f5ea609ff2b'
}

let testOffer4 = {
  price: 500,
  authorRole: 'tutor',
  proficiencyLevel: 'Beginner',
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  subjectId: '63da8767c9ad4c9a0b0eacd3',
  categoryId: '63525e23bf163f5ea609ff2b'
}

const updateData = {
  price: 555
}

describe('Offer controller', () => {
  let app, server, accessToken, testOfferResponse, testOfferResponse2, testOfferResponse3, testOfferResponse4

  beforeEach(async () => {
    ;({ app, server } = await serverInit())
    accessToken = await testUserAuthentication(app)
    testOfferResponse = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testOffer)
    testOfferResponse2 = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testOffer2)
    testOfferResponse3 = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testOffer3)
    testOfferResponse4 = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testOffer4)

    testOffer = testOfferResponse.body
    testOffer2 = testOfferResponse2.body
    testOffer3 = testOfferResponse3.body
    testOffer4 = testOfferResponse4.body
  })

  afterEach(async () => {
    await serverCleanup(server)
  })

  describe(`test POST ${endpointUrl}`, () => {
    it('should create new offer', async () => {
      const { _id, authorId } = testOfferResponse.body

      expect(testOfferResponse.statusCode).toBe(201)
      expect(testOfferResponse.body).toEqual(
        expect.objectContaining({
          _id,
          price: 330,
          proficiencyLevel: 'Beginner',
          description: 'TEST 123ASD',
          languages: ['Ukrainian'],
          authorRole: 'student',
          authorId,
          subjectId: '63da8767c9ad4c9a0b0eacd3',
          categoryId: '63525e23bf163f5ea609ff2b',
          status: 'pending',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })
  })

  describe(`test GET ${endpointUrl}`, () => {
    it('should GET all offers', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(expect.objectContaining(testOffer))
    })
  })

  describe(`test GET ${endpointUrl}:id`, () => {
    it('should get an offer by ID', async () => {
      const response = await app.get(endpointUrl + testOffer._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.body).toEqual(expect.objectContaining(testOffer))
      expect(response.statusCode).toBe(200)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })

  describe(`test UPDATE ${endpointUrl}:id`, () => {
    it('should update offer by ID', async () => {
      const response = await app
        .patch(endpointUrl + testOffer._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingOfferId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })

  describe(`test DELETE ${endpointUrl}:id`, () => {
    it('should delete offer by ID', async () => {
      const response = await app.delete(endpointUrl + testOffer._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })

  describe(`shoud return min and mix prices ${endpointUrl}`, () => {
    it('should throw OFFER_NOT_FOUND', async () => {
      const response = await app
        .get(endpointUrl + 'price-range?authorRole=')
        .set('Authorization', `Bearer ${accessToken}`)

      expectError(404, OFFER_NOT_FOUND, response)
    })

    it('should return min and max prices for student offers', async () => {
      const response = await app
        .get(endpointUrl + 'price-range?authorRole=student')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body && typeof response.body === 'object').toBe(true)
      expect(response.body).toHaveProperty('minPrice')
      expect(response.body).toHaveProperty('maxPrice')
      expect(typeof response.body.minPrice).toBe('number')
      expect(typeof response.body.maxPrice).toBe('number')
    })

    it('should return min and max prices for tutor offers', async () => {
      const response = await app
        .get(endpointUrl + 'price-range?authorRole=tutor')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body && typeof response.body === 'object').toBe(true)
      expect(response.body).toHaveProperty('minPrice')
      expect(response.body).toHaveProperty('maxPrice')
      expect(typeof response.body.minPrice).toBe('number')
      expect(typeof response.body.maxPrice).toBe('number')
    })
  })
})
