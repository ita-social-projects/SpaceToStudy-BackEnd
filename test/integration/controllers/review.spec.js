const { serverInit, serverCleanup } = require('~/test/setup')
const { REVIEW_NOT_FOUND, UNAUTHORIZED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/utils/testUserAuth')

const endpointUrl = '/reviews/'

let accessToken
const nonExistingReviewId = '63bed9ef260f18d04ab15da2'
let testReview = {
  comment: 'Good mentor and learning program',
  rating: 5,
  targetUserId: '63bed43c51ee69a0d4c5ff92',
  targetUserRole: 'tutor'
}
const updateData = {
  comment: 'waste of money',
  rating: 1
}

describe('Review controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl).send(testReview)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a review', async () => {
      accessToken = await testUserAuthentication(app)

      const response = await app
        .post(endpointUrl)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...testReview, offer: '63bed445cf00bcbdcdb4e648' })

      expect(response.statusCode).toBe(201)
      expect(response.body).toBeTruthy()
      expect(response.body).toEqual(expect.objectContaining(testReview))

      testReview = response.body
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should get all reviews', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ count: 1, reviews: [testReview] }))
    })
  })

  describe(`GET ${endpointUrl}/:reviewId`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl + testReview._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should get a review by id', async () => {
      const response = await app.get(endpointUrl + testReview._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining(testReview))
    })

    it('should throw REVIEW_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, REVIEW_NOT_FOUND, response)
    })
  })

  describe(`UPDATE ${endpointUrl}:reviewId`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl + testReview._id).send(updateData)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should UPDATE a review by ID', async () => {
      const response = await app
        .patch(endpointUrl + testReview._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expect(response.statusCode).toBe(204)
    })

    it('should throw REVIEW_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingReviewId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expectError(404, REVIEW_NOT_FOUND, response)
    })
  })

  describe(`DELETE ${endpointUrl}:reviewId`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl + testReview._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should delete a review by ID', async () => {
      const response = await app.delete(endpointUrl + testReview._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw REVIEW_NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, REVIEW_NOT_FOUND, response)
    })
  })
})
