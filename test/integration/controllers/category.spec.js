const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED, NOT_FOUND } = require('~/consts/errors')
const Category = require('~/models/category')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')

const endpointUrl = '/categories/'
const nonExistingReviewId = '63bed9ef260f18d04ab15da2'

let accessToken

let categoryBody = {
  name: 'Languages',
  categoryIcon: { path: 'mocked-path-to-icon', color: '#66C42C' }
}

const categoryData = {
  _id: expect.any(String),
  categoryIcon: categoryBody.categoryIcon,
  name: expect.any(String),
  totalOffers: expect.any(Number),
  updatedAt: expect.any(String),
  createdAt: expect.any(String)
}

const subjectBody = { name: 'English' }

describe('Category controller', () => {
  let app, server, testCategory, testSubject

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    accessToken = await testUserAuthentication(app)

    testCategory = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(categoryBody)

    subjectBody.category = testCategory.body._id
    categoryBody._id = testCategory.body._id

    testSubject = await app.post('/subjects/').set('Authorization', `Bearer ${accessToken}`).send(subjectBody)

    subjectBody._id = testSubject.body._id
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
      expect(testCategory.body).toEqual(expect.objectContaining(categoryData))
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should get all categories', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(categoryData)
    })

    it('should get all categories that contain "lan" in their name', async () => {
      const params = new URLSearchParams()
      params.set('name', 'lan')
      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(categoryData)
    })

    it('should get 5 categories', async () => {
      const params = new URLSearchParams()
      params.set('limit', '5')

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body.length).toBe(5)
    })

    it('should skip 8 categories and return the rest', async () => {
      const params = new URLSearchParams()
      params.set('skip', '8')

      const count = await Category.countDocuments()

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body.length).toBe(count - 8)
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl + categoryData._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingReviewId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Category.modelName]), response)
    })

    it('should get a category by id', async () => {
      const response = await app.get(endpointUrl + categoryBody._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining(categoryData))
    })
  })

  describe(`GET ${endpointUrl}names`, () => {
    it('should return categories names', async () => {
      const response = await app.get(endpointUrl + 'names').set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(typeof response.body[0]).toBe('object')
    })
  })

  describe(`GET min and mix prices ${endpointUrl}`, () => {
    it('should throw NOT_FOUND', async () => {
      const response = await app
        .get(endpointUrl + `${categoryData._id}/price-range?authorRole=student`)
        .set('Authorization', `Bearer ${accessToken}`)

      expectError(404, NOT_FOUND, response)
    })

    it('should return min and max prices for student offers', async () => {
      const response = await app
        .get(endpointUrl + `${categoryBody._id}/subjects/${subjectBody._id}/price-range?authorRole=student`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(typeof response.body).toBe('object')
      expect(response.body).toHaveProperty('minPrice')
      expect(response.body).toHaveProperty('maxPrice')
      expect(typeof response.body.minPrice).toBe('number')
      expect(typeof response.body.maxPrice).toBe('number')
    })

    it('should return min and max prices for tutor offers', async () => {
      const response = await app
        .get(endpointUrl + `${categoryBody._id}/subjects/${subjectBody._id}/price-range?authorRole=student`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(typeof response.body).toBe('object')
      expect(response.body).toHaveProperty('minPrice')
      expect(response.body).toHaveProperty('maxPrice')
      expect(typeof response.body.minPrice).toBe('number')
      expect(typeof response.body.maxPrice).toBe('number')
    })
  })
})
