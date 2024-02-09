const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED, NOT_FOUND } = require('~/consts/errors')
const Category = require('~/models/category')
const Offer = require('~/models/offer')
const TokenService = require('~/services/token')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')

const endpointUrl = '/categories/'
const nonExistingCategoryId = '63bed9ef260f18d04ab15da2'

let accessToken

let categoryBody = {
  name: 'Languages',
  appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
}

const testOfferData = {
  authorRole: 'tutor',
  price: 99,
  proficiencyLevel: 'Beginner',
  title: 'First-class teacher. Director of the Hogwarts school of magic',
  description: 'I will teach you how to protect yourself and your family from dark arts',
  languages: 'English',
  FAQ: [{ question: 'Do you enjoy being a director of the Hogwarts?', answer: 'Actually yes, i really like it.' }]
}

const subjectBody = {
  name: 'English'
}
describe('Category controller', () => {
  let app, server, testCategory, testSubject, testStudentUser

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app)

    testStudentUser = TokenService.validateAccessToken(accessToken)

    testCategory = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(categoryBody)

    testSubject = await app
      .post('/subjects/')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ ...subjectBody, category: testCategory.body._id })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl).send(categoryBody)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should create a new category', async () => {
      expect(testCategory.statusCode).toBe(201)
      expect(testCategory.body).toMatchObject({
        ...categoryBody,
        totalOffers: { student: 0, tutor: 0 },
        updatedAt: expect.any(String),
        createdAt: expect.any(String)
      })
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should get all categories', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              ...categoryBody,
              totalOffers: { student: 0, tutor: 0 },
              updatedAt: expect.any(String),
              createdAt: expect.any(String)
            })
          ],
          count: 1
        })
      )
    })

    it('should get all categories that contain "lan" in their name', async () => {
      const params = new URLSearchParams()
      params.set('name', 'lan')

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          items: [
            expect.objectContaining({
              ...categoryBody,
              totalOffers: { student: 0, tutor: 0 },
              updatedAt: expect.any(String),
              createdAt: expect.any(String)
            })
          ],
          count: 1
        })
      )
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl + testCategory.body._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingCategoryId).set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Category.modelName]), response)
    })

    it('should get a category by id', async () => {
      const response = await app.get(endpointUrl + testCategory.body._id).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject({
        ...categoryBody,
        totalOffers: { student: 0, tutor: 0 },
        updatedAt: expect.any(String),
        createdAt: expect.any(String)
      })
    })
  })

  describe(`GET ${endpointUrl}names`, () => {
    it('should return categories names', async () => {
      const response = await app.get(endpointUrl + 'names').set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(typeof response.body[0]).toBe('object')
    })
  })

  describe(`GET min and max prices ${endpointUrl}`, () => {
    it('should throw NOT_FOUND', async () => {
      const response = await app
        .get(endpointUrl + `${categoryBody._id}/price-range?authorRole=student`)
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, NOT_FOUND, response)
    })

    it('should return min and max prices for student offers', async () => {
      const response = await app
        .get(endpointUrl + `${testCategory.body._id}/subjects/${testSubject.body._id}/price-range?authorRole=student`)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(typeof response.body).toBe('object')
      expect(response.body).toHaveProperty('minPrice')
      expect(response.body).toHaveProperty('maxPrice')
      expect(typeof response.body.minPrice).toBe('number')
      expect(typeof response.body.maxPrice).toBe('number')
    })

    it('should return min and max prices for tutor offers', async () => {
      await Offer.create({
        author: testStudentUser.id,
        subject: testSubject.body._id,
        category: testCategory.body._id,
        ...testOfferData
      })

      const response = await app
        .get(endpointUrl + `${testCategory.body._id}/subjects/${testSubject.body._id}/price-range?authorRole=tutor`)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(typeof response.body).toBe('object')
      expect(response.body).toHaveProperty('minPrice')
      expect(response.body).toHaveProperty('maxPrice')
      expect(typeof response.body.minPrice).toBe('number')
      expect(typeof response.body.maxPrice).toBe('number')
    })
  })
})
