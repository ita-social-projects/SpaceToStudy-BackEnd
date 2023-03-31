const { serverInit, serverCleanup } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED } = require('~/consts/errors')
const Category = require('~/models/category')

const endpointUrl = '/categories/'
const nonExistingReviewId = '63bed9ef260f18d04ab15da2'

let accessToken
let categoryData = {
  name: 'languages',
  categoryIcon: 'mocked-path-to-icon'
}

describe('Category controller', () => {
  let app, server

  beforeEach(async () => {
    ;({ app, server } = await serverInit())

    accessToken = await testUserAuthentication(app)

    const categoriesResponse = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

    categoryData._id = categoriesResponse.body[0]._id
  })

  afterEach(async () => {
    await serverCleanup(server)
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
      expect(response.body[0]).toEqual(expect.objectContaining(categoryData))
    })

    it('should get all categories that contain "lan" in their name', async () => {
      const params = new URLSearchParams()
      params.set('match', 'lan')
      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(expect.objectContaining(categoryData))
    })

    it('should get 5 categories', async () => {
      const params = new URLSearchParams()
      params.set('limit', '5')

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(expect.objectContaining(categoryData))
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

      expectError(404, DOCUMENT_NOT_FOUND(Category.modelName), response)
    })

    it('should get a category by id', async () => {
      const response = await app.get(endpointUrl + categoryData._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining(categoryData))
    })
  })

  describe(`GET ${endpointUrl}names`, () => {
    it('should return categories names', async () => {
      const response = await app.get(endpointUrl + 'names').set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toBeInstanceOf(String)
    })
  })
})
