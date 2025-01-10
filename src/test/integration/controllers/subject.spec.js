const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, DOCUMENT_ALREADY_EXISTS } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Subject = require('~/models/subject')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')

const {
  roles: { ADMIN }
} = require('~/consts/auth')

const endpointUrl = '/subjects/'
const nonExistingSubjectId = '63cf23e07281224fbbee5958'

const categoryBody = { name: 'testCategory', appearance: { color: '#F67C41', icon: 'mocked-path-to-icon' } }
const subjectBody = { name: 'English' }

let adminUser = {
  role: [ADMIN],
  firstName: 'TestAdmin',
  lastName: 'AdminTest',
  email: 'testadmin@gmail.com',
  password: 'supersecretpass123',
  appLanguage: 'en',
  isEmailConfirmed: true,
  isFirstLogin: false,
  lastLoginAs: ADMIN
}

describe('Subject controller', () => {
  let app, server, testUserAccessToken, adminAccessToken, testSubject

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()
    adminAccessToken = await testUserAuthentication(app, adminUser)

    const categoryResponse = await app
      .post('/categories/')
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .send(categoryBody)
    const category = { _id: categoryResponse.body._id, appearance: categoryResponse.body.appearance }
    subjectBody.category = category

    testSubject = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${adminAccessToken}`])
      .send(subjectBody)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw DOCUMENT_ALREADY_EXISTS', async () => {
      const error = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .send(subjectBody)

      expectError(409, DOCUMENT_ALREADY_EXISTS('name'), error)
    })

    it('should create a subject', async () => {
      expect(testSubject.statusCode).toBe(201)
      expect(testSubject.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: subjectBody.name,
          category: subjectBody.category._id,
          totalOffers: {
            student: 0,
            tutor: 0
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    beforeEach(async () => {
      testUserAccessToken = await testUserAuthentication(app)
    })
    it('should GET all subjects', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${testUserAccessToken}`])

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body.items[0]).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: subjectBody.name,
          category: subjectBody.category,
          totalOffers: {
            student: 0,
            tutor: 0
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should get a subject by ID', async () => {
      const response = await app
        .get(endpointUrl + testSubject.body._id)
        .set('Cookie', [`accessToken=${testUserAccessToken}`])

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: subjectBody.name,
          category: subjectBody.category._id,
          totalOffers: {
            student: 0,
            tutor: 0
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .get(endpointUrl + nonExistingSubjectId)
        .set('Cookie', [`accessToken=${testUserAccessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Subject.modelName]), response)
    })
  })

  describe(`UPDATE ${endpointUrl}:id`, () => {
    it('should update subject by ID', async () => {
      const response = await app
        .patch(endpointUrl + testSubject.body._id)
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .send({ name: 'Eng' })

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingSubjectId)
        .set('Cookie', [`accessToken=${adminAccessToken}`])
        .send({ name: 'Eng' })

      expectError(404, DOCUMENT_NOT_FOUND([Subject.modelName]), response)
    })
    it('should throw FORBIDDEN', async () => {
      testUserAccessToken = await testUserAuthentication(app)
      const response = await app
        .delete(endpointUrl + testSubject.body._id)
        .set('Cookie', [`accessToken=${testUserAccessToken}`])

      expect(response.statusCode).toBe(403)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete subject by ID', async () => {
      const response = await app
        .delete(endpointUrl + testSubject.body._id)
        .set('Cookie', [`accessToken=${adminAccessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .delete(endpointUrl + nonExistingSubjectId)
        .set('Cookie', [`accessToken=${adminAccessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Subject.modelName]), response)
    })

    it('should throw FORBIDDEN', async () => {
      testUserAccessToken = await testUserAuthentication(app)
      const response = await app
        .delete(endpointUrl + testSubject.body._id)
        .set('Cookie', [`accessToken=${testUserAccessToken}`])

      expect(response.statusCode).toBe(403)
    })
  })
})
