const { serverInit, serverCleanup } = require('~/test/setup')
const { REVIEW_NOT_FOUND } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')

const endpointUrl = '/reviews/'

let testReview
const nonExistingReviewId = '63bed9ef260f18d04ab15da2'

describe('Review controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a review', async () => {
      const response = await app.post(endpointUrl).send({
        comment: 'Good mentor and learning program',
        rating: 5,
        tutor: '63bed43c51ee69a0d4c5ff92',
        student: '63bed445cf00bcbdcdb4e648'
      })

      expect(response.statusCode).toBe(201)
      expect(response.body).toBeTruthy()
      expect(response.body).toEqual(
        expect.objectContaining({
          comment: 'Good mentor and learning program',
          rating: 5,
          tutor: '63bed43c51ee69a0d4c5ff92',
          student: '63bed445cf00bcbdcdb4e648'
        })
      )

      testReview = response.body
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should get all reviews', async () => {
      const response = await app.get(endpointUrl)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          comment: expect.any(String),
          rating: expect.any(Number),
          tutor: expect.any(String),
          student: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })
  })

  describe(`GET ${endpointUrl}/:reviewId`, () => {
    it('should get a review by id', async () => {
      const { _id, comment, rating, tutor, student, createdAt, updatedAt } = testReview

      const response = await app.get(endpointUrl + _id)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          _id,
          comment,
          rating,
          tutor,
          student,
          createdAt,
          updatedAt
        })
      )
    })

    it('should throw REVIEW_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingReviewId)

      expectError(404, REVIEW_NOT_FOUND, response)
    })
  })

  describe(`UPDATE ${endpointUrl}:reviewId`, () => {
    it('should UPDATE a review by ID', async () => {
      const response = await app.patch(endpointUrl + testReview._id).send({
        comment: 'horrible mentor',
        rating: 1
      })

      expect(response.statusCode).toBe(204)
    })

    it('should throw REVIEW_NOT_FOUND', async () => {
      const response = await app.patch(endpointUrl + nonExistingReviewId).send({
        comment: 'horrible mentor',
        rating: 1
      })

      expectError(404, REVIEW_NOT_FOUND, response)
    })
  })

  describe(`DELETE ${endpointUrl}:reviewId`, () => {
    it('should delete a review by ID', async () => {
      const response = await app.delete(endpointUrl + testReview._id)

      expect(response.statusCode).toBe(204)
    })

    it('should throw REVIEW_NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingReviewId)

      expectError(404, REVIEW_NOT_FOUND, response)
    })
  })
})
