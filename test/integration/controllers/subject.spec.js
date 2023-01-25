const { serverCleanup, serverInit } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { SUBJECT_NOT_FOUND } = require('~/consts/errors')

const endpointUrl = '/subjects/'

let testSubject
const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZDBmNWY5YWZiMDlmMTQ4YzM0MmU2NCIsInJvbGUiOiJ0dXRvciIsImlzRmlyc3RMb2dpbiI6dHJ1ZSwiaWF0IjoxNjc0NjM4ODQ1LCJleHAiOjE2NzQ2NDI0NDV9.IHzUDH_IeEcgEnLzsNUarpLoiQOZi_IPHsX7PSaUoZc'
const nonExistingSubjectId = '63cf23e07281224fbbee5958'

describe('Subject controller', () => {
  let app, server

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  afterAll(async () => {
    await serverCleanup(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a subject', async () => {
      const response = await app.post(endpointUrl).set('Authorization', `Bearer ${accessToken}`).send({
        name: 'English',
        price: 20,
        proficiencyLevel: 'Intermediate',
        category: '63525e23bf163f5ea609ff27'
      })

      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual(
        expect.objectContaining({
          tutorId: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
          proficiencyLevel: expect.any(String),
          category: expect.any(String)
        })
      )

      testSubject = response.body
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should GET all subjects', async () => {
      const response = await app.get(endpointUrl).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body)).toBeTruthy()
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          tutorId: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
          proficiencyLevel: expect.any(String),
          category: expect.any(String)
        })
      )
    })
  })

  describe(`GET ${endpointUrl}:id`, () => {
    it('should get a subject by ID', async () => {
      const response = await app.get(endpointUrl + testSubject._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(200)
    })

    it('should throw SUBJECT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingSubjectId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, SUBJECT_NOT_FOUND, response)
    })
  })

  describe(`UPDATE ${endpointUrl}:id`, () => {
    it('should update subject by ID', async () => {
      const response = await app
        .patch(endpointUrl + testSubject._id)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Eng' })

      expect(response.statusCode).toBe(204)
    })

    it('should throw SUBJECT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingSubjectId)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Eng' })

      expectError(404, SUBJECT_NOT_FOUND, response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete subject by ID', async () => {
      const response = await app.delete(endpointUrl + testSubject._id).set('Authorization', `Bearer ${accessToken}`)

      expect(response.statusCode).toBe(204)
    })

    it('should throw SUBJECT_NOT_FOUND', async () => {
      const response = await app.get(endpointUrl + nonExistingSubjectId).set('Authorization', `Bearer ${accessToken}`)

      expectError(404, SUBJECT_NOT_FOUND, response)
    })
  })
})
