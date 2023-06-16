const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, UNAUTHORIZED, NOT_FOUND } = require('~/consts/errors')
const Category = require('~/models/category')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')

const endpointUrl = '/categories/'
const nonExistingCategoryId = '63bed9ef260f18d04ab15da2'

let accessToken
let categoryData
let categoryResponse

let categoryBody = {
  name: 'Languages',
  appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
}

const subjectBody = [
  {
    name: 'Web design'
  },
  {
    name: 'Guitar'
  },
  {
    name: 'Bass'
  },
  {
    name: 'Piano'
  },
  {
    name: 'Spanish'
  },
  {
    name: 'Cybersecurity'
  },
  {
    name: 'Violins'
  },
  {
    name: 'pian'
  },
  {
    name: 'Sound design'
  },
  {
    name: 'Drums'
  },
  {
    name: 'English'
  },
  {
    name: 'Danish'
  }
]

describe('Category controller', () => {
  let app, server, testCategory, testSubject

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()

    categoryResponse = await Category.find()

    accessToken = await testUserAuthentication(app)

    for (let i = 0; i < 7; i++) {
      const category = categoryResponse[i]
      const subject = subjectBody[i]

      subject.category = category._id

      testSubject = await app.post('/subjects/').set('Authorization', `Bearer ${accessToken}`).send(subject)

      subject._id = testSubject.body._id
    }
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
      testCategory = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(categoryBody)

      subjectBody.category = testCategory.body._id
      categoryBody._id = testCategory.body._id

      expect(testCategory.statusCode).toBe(201)
      categoryData = {
        _id: expect.any(String),
        appearance: categoryBody.appearance,
        name: expect.any(String),
        totalOffers: {
          student: 0,
          tutor: 0
        },
        updatedAt: expect.any(String),
        createdAt: expect.any(String)
      }
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
      expect(response.body).toEqual(expect.objectContaining({ items: expect.any(Array), count: 7 }))
    })

    it('should get all categories that contain "lan" in their name', async () => {
      const params = new URLSearchParams()
      params.set('name', 'lan')

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ items: expect.any(Array), count: 1 }))
    })

    it('should get 5 categories', async () => {
      const params = new URLSearchParams()
      params.set('limit', '5')

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ items: expect.any(Array), count: 5 }))
      expect(response.body.items.length).toBe(5)
    })

    it('should skip 5 categories and return the rest', async () => {
      const params = new URLSearchParams()
      params.set('skip', '5')
      params.set('limit', '6')

      const response = await app
        .get(endpointUrl + '?' + params.toString())
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({ items: expect.any(Array), count: 2 }))
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl + categoryData._id)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingCategoryId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Category.modelName]), response)
    })

    it('should get a category by id', async () => {
      const response = await app
        .get(endpointUrl + categoryResponse[0]._id)
        .set('Authorization', `Bearer ${accessToken}`)

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

  describe(`GET min and max prices ${endpointUrl}`, () => {
    it('should throw NOT_FOUND', async () => {
      const response = await app
        .get(endpointUrl + `${categoryBody._id}/price-range?authorRole=student`)
        .set('Authorization', `Bearer ${accessToken}`)

      expectError(404, NOT_FOUND, response)
    })

    it('should return min and max prices for student offers', async () => {
      const response = await app
        .get(endpointUrl + `${categoryResponse[0]._id}/subjects/${subjectBody[0]._id}/price-range?authorRole=student`)
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
        .get(endpointUrl + `${categoryResponse[0]._id}/subjects/${subjectBody[0]._id}/price-range?authorRole=tutor`)
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
