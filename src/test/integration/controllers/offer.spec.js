const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Offer = require('~/models/offer')
const Category = require('~/models/category')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const {
  roles: { TUTOR, STUDENT }
} = require('~/consts/auth')
const {
  enums: { STATUS_ENUM }
} = require('~/consts/validation')

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
  enrolledUsers: ['6512e1ca5fd987b6ce926c2e', '652ba66bf6770c3a2d5d8549'],
  subject: '',
  category: {
    _id: '',
    appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
  }
}

const tutorUserData = {
  role: TUTOR,
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: TUTOR
}

const deactivatedUserData = {
  role: STUDENT,
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'albus_dumbledore@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: STUDENT,
  status: {
    [STUDENT]: STATUS_ENUM[2]
  }
}

const updateData = {
  price: 555
}

describe('Offer controller', () => {
  let app, server, accessToken, tutorAccessToken, testOfferResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app)
    tutorAccessToken = await testUserAuthentication(app, tutorUserData)

    const categoryResponse = await Category.find()

    const { _id, appearance } = categoryResponse[0]
    const category = { _id: _id.toString(), appearance }

    const subjectResponse = await app
      .post('/subjects/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({
        name: 'testSubject',
        category: category
      })
    const subject = subjectResponse.body._id

    testOffer.category = category
    testOffer.subject = subject

    testOfferResponse = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(testOffer)

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
          enrolledUsers: expect.any(Array),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })
  })

  describe(`test GET ${endpointUrl}`, () => {
    beforeEach(async () => {
      const deactivatedUserAccessToken = await testUserAuthentication(app, deactivatedUserData)
      await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${deactivatedUserAccessToken}`])
        .send(testOffer)
    })

    it('should GET all offers of active users', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ count: 1, items: [expect.any(Object)] }))
    })
  })

  describe(`test GET ${endpointUrl}:id`, () => {
    it('should get an offer by ID', async () => {
      const response = await app.get(endpointUrl + testOffer._id).set('Cookie', [`accessToken=${accessToken}`])

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
        },
        chatId: null
      })
      expect(response.statusCode).toBe(200)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })

  describe(`test UPDATE ${endpointUrl}:id`, () => {
    it('should update offer by ID', async () => {
      const response = await app
        .patch(endpointUrl + testOffer._id)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateData)

      expect(response.statusCode).toBe(204)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl + testOffer._id)
        .set('Cookie', [`accessToken=${tutorAccessToken}`])
        .send(updateData)

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingOfferId)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateData)

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })

  describe(`test DELETE ${endpointUrl}:id`, () => {
    it('should delete offer by ID', async () => {
      const response = await app.delete(endpointUrl + testOffer._id).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingOfferId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Offer.modelName]), response)
    })
  })
})
