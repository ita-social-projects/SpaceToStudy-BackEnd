const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Offer = require('~/models/offer')
const Category = require('~/models/category')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')

const endpointUrl = '/offers/'
const nonExistingOfferId = '6329a45601bd35b5fff1cf8c'

let testOffer = {
  price: 330,
  proficiencyLevel: ['Beginner'],
  title: 'Test Title',
  author: '',
  authorRole: 'student',
  FAQ: [{ question: 'question1', answer: 'answer1' }],
  description: 'TEST 123ASD',
  languages: ['Ukrainian'],
  subject: '',
  category: {
    _id: '',
    appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
  }
}

const updateData = {
  price: 555
}

describe('Offer controller', () => {
  let app, server, accessToken, testOfferResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app)

    const categoryResponse = await Category.find()

    const { _id, appearance } = categoryResponse[0]
    const category = { _id: _id.toString(), appearance }

    const subjectResponse = await app.post('/subjects/').set('Authorization', `Bearer ${accessToken}`).send({
      name: 'testSubject',
      category: category
    })
    const subject = subjectResponse.body._id

    testOffer.category = category
    testOffer.subject = subject

    testOfferResponse = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(testOffer)

    testOffer = testOfferResponse.body
    testOffer.category = category
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
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
          title: 'Test Title',
          description: 'TEST 123ASD',
          languages: ['Ukrainian'],
          authorRole: 'student',
          author,
          subject,
          category,
          status: 'active',
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
      expect(response.body).toEqual(expect.objectContaining({ count: 1, items: [expect.any(Object)] }))
    })
  })

  describe(`test GET ${endpointUrl}:id`, () => {
    it('should get an offer by ID', async () => {
      const response = await app.get(endpointUrl + testOffer._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.body).toEqual({
        ...testOffer,
        author: {
          _id: testOffer.author,
          firstName: 'Tart',
          lastName: 'Drilling',
          FAQ: [{ _id: expect.any(String), answer: 'answer1', question: 'question1' }],
          totalReviews: {
            student: 0,
            tutor: 0
          },
          averageRating: {
            student: 0,
            tutor: 0
          }
        },
        subject: {
          _id: testOffer.subject,
          name: 'TestSubject'
        }
      })
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
})
