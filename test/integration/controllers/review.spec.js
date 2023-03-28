const { serverInit, serverCleanup } = require('~/test/setup')
const { UNAUTHORIZED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/utils/testUserAuth')

const endpointUrl = '/reviews/'

// const nonExistingReviewId = '63bed9ef260f18d04ab15da2'
let reviewBody = {
  comment: 'Good mentor and learning program',
  rating: 5,
  targetUserId: '63bed43c51ee69a0d4c5ff92',
  targetUserRole: 'tutor',
  offer: '63bed43c51ee69a0d4c5ff93'
}
// const updateData = {
//   comment: 'waste of money',
//   rating: 1
// }

describe('Review controller', () => {
  let app, server, accessToken, testReview

  beforeEach(async () => {
    ;({ app, server } = await serverInit())
    accessToken = await testUserAuthentication(app)
    testReview = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(reviewBody)
  })

  afterEach(async () => {
    await serverCleanup(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl).send(testReview)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a review', async () => {
      expect(testReview.statusCode).toBe(201)
      expect(testReview.body).toEqual(expect.objectContaining(reviewBody))
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
      // expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(expect.objectContaining(testReview))
    })
  })

  // describe(`GET ${endpointUrl}/:id`, () => {
  //   it('should throw UNAUTHORIZED', async () => {
  //     const response = await app.get(endpointUrl + testReview._id)

  //     expectError(401, UNAUTHORIZED, response)
  //   })

  //   it('should get a review by id', async () => {
  //     const response = await app.get(endpointUrl + testReview._id).set('Authorization', `Bearer ${accessToken}`)

  //     expect(response.statusCode).toBe(200)
  //     expect(response.body).toEqual(expect.objectContaining(testReview))
  //   })

  //   it('should throw REVIEW_NOT_FOUND', async () => {
  //     const response = await app.get(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

  //     expectError(404, REVIEW_NOT_FOUND, response)
  //   })
  // })

  // describe(`UPDATE ${endpointUrl}:id`, () => {
  //   it('should throw UNAUTHORIZED', async () => {
  //     const response = await app.patch(endpointUrl + testReview._id).send(updateData)

  //     expectError(401, UNAUTHORIZED, response)
  //   })

  //   it('should UPDATE a review by ID', async () => {
  //     const response = await app
  //       .patch(endpointUrl + testReview._id)
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send(updateData)

  //     expect(response.statusCode).toBe(204)
  //   })

  //   it('should throw REVIEW_NOT_FOUND', async () => {
  //     const response = await app
  //       .patch(endpointUrl + nonExistingReviewId)
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send(updateData)

  //     expectError(404, REVIEW_NOT_FOUND, response)
  //   })
  // })

  // describe(`DELETE ${endpointUrl}:id`, () => {
  //   it('should throw UNAUTHORIZED', async () => {
  //     const response = await app.delete(endpointUrl + testReview._id)

  //     expectError(401, UNAUTHORIZED, response)
  //   })

  //   it('should delete a review by ID', async () => {
  //     const response = await app.delete(endpointUrl + testReview._id).set('Authorization', `Bearer ${accessToken}`)

  //     expect(response.statusCode).toBe(204)
  //   })

  //   it('should throw REVIEW_NOT_FOUND', async () => {
  //     const response = await app.delete(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

  //     expectError(404, REVIEW_NOT_FOUND, response)
  //   })
  // })
})
