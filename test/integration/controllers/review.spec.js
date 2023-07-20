const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED } = require('~/consts/errors')
const { expectError } = require('~/test/helpers')
const testUserAuthentication = require('~/utils/testUserAuth')
const Review = require('~/models/review')
const Category = require('~/models/category')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const jwt = require('jsonwebtoken')
const {
  config: { JWT_ACCESS_SECRET }
} = require('~/configs/config')

const endpointUrl = '/reviews/'
const offerEndpointUrl = '/offers/'
const subjectEndpointUrl = '/subjects/'

const nonExistingReviewId = '63bed9ef260f18d04ab15da2'

let reviewBody = {
  comment: 'Good mentor and learning program',
  rating: 5,
  targetUserRole: 'student'
}
let offerBody = {
  title: 'Test title',
  price: 330,
  proficiencyLevel: ['Beginner'],
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  category: {
    _id: '',
    appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
  }
}
let subjectBody = {
  name: 'English',
  category: ''
}
const updateData = {
  comment: 'waste of money',
  rating: 1
}

describe('Review controller', () => {
  let app, server, accessToken, testOffer, testReview, testSubject, userId

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()
    accessToken = await testUserAuthentication(app)

    const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET)
    userId = decoded.id
    reviewBody.targetUserId = userId

    const categoryResponse = await Category.find()

    const { _id, name } = categoryResponse[0]
    const category = { _id: _id.toString(), name }

    subjectBody.category = _id
    offerBody.category = category
    subjectBody.category = category

    testSubject = await app.post(subjectEndpointUrl).set('Authorization', `Bearer ${accessToken}`).send(subjectBody)
    subjectBody = testSubject.body

    testOffer = await app
      .post(offerEndpointUrl)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...offerBody, subject: subjectBody._id })

    offerBody = testOffer.body
    offerBody.category = category

    testReview = await app
      .post(endpointUrl)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...reviewBody, offer: offerBody._id })

    reviewBody = testReview.body
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
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
        targetUserId: userId,
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
      const { _id: subject } = subjectBody

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
            targetUserId: userId,
            targetUserRole: 'student',
            offer: {
              _id,
              category: offerBody.category,
              proficiencyLevel: ['Beginner'],
              subject: {
                _id: subject,
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
      const { _id: subject } = subjectBody

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
        targetUserId: userId,
        targetUserRole: 'student',
        offer: {
          _id,
          category: offerBody.category,
          proficiencyLevel: ['Beginner'],
          subject: {
            _id: subject,
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
