const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { DOCUMENT_NOT_FOUND, DOCUMENT_ALREADY_EXISTS } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const Subject = require('~/models/subject')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')

const endpointUrl = '/subjects/'
const nonExistingSubjectId = '63cf23e07281224fbbee5958'

const categoryBody = { name: 'testCategory' }
const subjectBody = { name: 'English' }

describe('Subject controller', () => {
  let app, server, accessToken, testSubject

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    await checkCategoryExistence()
    accessToken = await testUserAuthentication(app)

    const categoryResponse = await app
      .post('/categories/')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(categoryBody)
    const category = categoryResponse.body._id
    subjectBody.category = category

    testSubject = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(subjectBody)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should throw DOCUMENT_ALREADY_EXISTS', async () => {
      const error = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send(subjectBody)

      expectError(409, DOCUMENT_ALREADY_EXISTS('name'), error)
    })

    it('should create a subject', async () => {
      expect(testSubject.statusCode).toBe(201)
      expect(testSubject.body).toEqual(
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

  describe(`GET ${endpointUrl}`, () => {
    it('should GET all subjects', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

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
      const response = await app.get(endpointUrl + testSubject.body._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(
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

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingSubjectId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Subject.modelName]), response)
    })
  })

  describe(`UPDATE ${endpointUrl}:id`, () => {
    it('should update subject by ID', async () => {
      const response = await app
        .patch(endpointUrl + testSubject.body._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Eng' })

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingSubjectId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Eng' })

      expectError(404, DOCUMENT_NOT_FOUND([Subject.modelName]), response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete subject by ID', async () => {
      const response = await app
        .delete(endpointUrl + testSubject.body._id)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .delete(endpointUrl + nonExistingSubjectId)
        .set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Subject.modelName]), response)
    })
  })
})
