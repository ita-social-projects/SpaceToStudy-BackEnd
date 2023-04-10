const { serverInit, serverCleanup } = require('~/test/setup')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/utils/testUserAuth')
const Review = require('~/models/review')

const endpointUrl = '/reviews/'
const offerEndpointUrl = '/offers/'
const subjectEndpointUrl = '/subjects/'

const nonExistingReviewId = '63bed9ef260f18d04ab15da2'

let reviewBody = {
  comment: 'Good mentor and learning program',
  rating: 5,
  targetUserId: '6424a09cde0a9091d01120a7',
  targetUserRole: 'student'
}
let offerBody = {
  price: 330,
  proficiencyLevel: 'Beginner',
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  categoryId: '63525e23bf163f5ea609ff27'
}
let subjectBody = {
  name: 'English',
  category: '63525e23bf163f5ea609ff27'
}
const updateData = {
  comment: 'waste of money',
  rating: 1
}

describe('Review controller', () => {
  let app, server, accessToken, testOffer, testReview, testSubject

  beforeEach(async () => {
    ;({ app, server } = await serverInit())
    accessToken = await testUserAuthentication(app)

    testSubject = await app.post(subjectEndpointUrl).set('Authorization', `Bearer ${accessToken}`).send(subjectBody)
    subjectBody = testSubject.body

    testOffer = await app
      .post(offerEndpointUrl)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...offerBody, subjectId: subjectBody._id })

    offerBody = testOffer.body

    testReview = await app
      .post(endpointUrl)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...reviewBody, offer: offerBody._id })

    reviewBody = testReview.body
  })

  afterEach(async () => {
    await serverCleanup(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl).send(reviewBody)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a review', async () => {
      const { _id } = offerBody

      expect(testReview.statusCode).toBe(201)
      expect(testReview.body).toEqual({
        _id: expect.any(String),
        comment: 'Good mentor and learning program',
        rating: 5,
        author: expect.any(String),
        targetUserId: '6424a09cde0a9091d01120a7',
        targetUserRole: 'student',
        offer: _id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should get all reviews', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)
      const { author } = reviewBody
      const { _id } = offerBody
      const { _id: subjectId } = subjectBody

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.reviews)).toBeTruthy()
      expect(response.body).toEqual({
        count: 1,
        reviews: [
          {
            _id: expect.any(String),
            comment: 'Good mentor and learning program',
            rating: 5,
            author: {
              _id: author,
              firstName: 'Tart',
              lastName: 'Drilling'
            },
            targetUserId: '6424a09cde0a9091d01120a7',
            targetUserRole: 'student',
            offer: {
              _id,
              categoryId: null,
              proficiencyLevel: 'Beginner',
              subjectId: {
                _id: subjectId,
                name: 'English'
              }
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ]
      })
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl + reviewBody._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should get a review by ID', async () => {
      const response = await app.get(endpointUrl + reviewBody._id).set('Authorization', `Bearer ${accessToken}`)
      const { author } = reviewBody
      const { _id } = offerBody
      const { _id: subjectId } = subjectBody

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({
        _id: expect.any(String),
        comment: 'Good mentor and learning program',
        rating: 5,
        author: {
          _id: author,
          firstName: 'Tart',
          lastName: 'Drilling'
        },
        targetUserId: '6424a09cde0a9091d01120a7',
        targetUserRole: 'student',
        offer: {
          _id,
          categoryId: null,
          proficiencyLevel: 'Beginner',
          subjectId: {
            _id: subjectId,
            name: 'English'
          }
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Review.modelName]), response)
    })
  })

  describe(`UPDATE ${endpointUrl}:id`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl + reviewBody._id).send(updateData)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should update a review by ID', async () => {
      const response = await app
        .patch(endpointUrl + reviewBody._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingReviewId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)

      expectError(404, DOCUMENT_NOT_FOUND([Review.modelName]), response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl + reviewBody._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should delete a review by ID', async () => {
      const response = await app.delete(endpointUrl + reviewBody._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.delete(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Review.modelName]), response)
    })
  })
})
