const { serverCleanup, serverInit } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Offer = require('~/models/offer')

const endpointUrl = '/offers/'
const nonExistingOfferId = '6329a45601bd35b5fff1cf8c'

let testOffer = {
  price: 330,
  proficiencyLevel: ['Beginner'],
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  subject: '',
  category: ''
}

const updateData = {
  price: 555
}

describe('Offer controller', () => {
  let app, server, accessToken, testOfferResponse

  beforeEach(async () => {
    ;({ app, server } = await serverInit())
    accessToken = await testUserAuthentication(app)

    const categoryResponse = await app.get('/categories/').set('Authorization', `Bearer ${accessToken}`)
    const category = categoryResponse.body[0]._id

    const subjectResponse = await app.post('/subjects/').set('Authorization', `Bearer ${accessToken}`).send({
      name: 'testSubject',
      category: category
    })
    const subject = subjectResponse.body._id

    testOffer.category = category
    testOffer.subject = subject

    testOfferResponse = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testOffer)

    testOffer = testOfferResponse.body
  })

  afterEach(async () => {
    await serverCleanup(server)
  })

  describe(`test POST ${endpointUrl}`, () => {
    it('should create new offer', async () => {
      const { _id, author, category, subject } = testOffer

      expect(testOfferResponse.statusCode).toBe(201)
      expect(testOfferResponse.body).toEqual(
        expect.objectContaining({
          _id,
          price: 330,
          proficiencyLevel: ['Beginner'],
          description: 'TEST 123ASD',
          languages: ['Ukrainian'],
          authorRole: 'student',
          author,
          subject,
          category,
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
      expect(response.body).toEqual(expect.objectContaining({ count: 1, offers: [expect.any(Object)] }))
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

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
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

  describe(`test GET ${endpointUrl}:id/related`, () => {
    it('should get related offers without offer with specified id', async () => {
      const { body, statusCode } = await app
        .get(endpointUrl + testOffer._id)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(body.every((obj) => obj._id !== testOffer._id)).toBe(true)
      expect(statusCode).toBe(200)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })
})
