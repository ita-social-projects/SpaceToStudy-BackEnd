const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/app/consts/errors')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const TokenService = require('~/app/services/token')

const Cooperation = require('~/app/models/cooperation')
const Note = require('~/app/models/note')

const endpointUrl = (id = ':id', noteId = '') => `/cooperations/${id}/notes/${noteId}`

const nonExistingCooperationId = '19cf23e07281224fbbee3241'

const mockedInitiatorId = '649c1fc9c75d3e44440e3a15'

const testCooperationData = {
  price: 99,
  receiverRole: 'tutor',
  proficiencyLevel: 'Beginner',
  additionalInfo:
    'I don`t like both Dark Arts and Voldemort that`s why i want to learn your subject and became your student',
  receiver: '649c147ac75d3e44440e3a12',
  offer: '649c148cc75d3e44440e3a13',
  title: 'First class teacher. Director of the Hogwarts school witchcraft and wizardry.',
  initiatorRole: 'student',
  needAction: 'tutor'
}

const testNoteData = {
  text: 'my comment',
  isPrivate: false
}

const updateNoteData = {
  text: 'changed text',
  isPrivate: true
}

describe('Note controller', () => {
  let app, server, accessToken, testUser, testCooperation, testNote

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app)

    testUser = TokenService.validateAccessToken(accessToken)

    testCooperation = await Cooperation.create({
      initiator: testUser.id,
      ...testCooperationData
    })

    testNote = await app
      .post(endpointUrl(testCooperation._id))
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(testNoteData)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl()}`, () => {
    it('get all notes', async () => {
      const response = await app.get(endpointUrl(testCooperation._id)).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.status).toBe(200)
      expect(response.body.length).toBe(1)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toMatchObject({
        _id: testNote._body._id,
        text: expect.any(String),
        author: {
          _id: testUser.id,
          firstName: expect.any(String),
          lastName: expect.any(String)
        },
        cooperation: testCooperation._id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw FORBIDDEN', async () => {
      const cooperation = await Cooperation.create({
        ...testCooperationData,
        initiator: mockedInitiatorId
      })

      const response = await app.post(endpointUrl(cooperation._id)).set('Cookie', [`accessToken=${accessToken}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for cooperation', async () => {
      const response = await app
        .post(endpointUrl(nonExistingCooperationId))
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Cooperation.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl(testCooperation._id))

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`POST ${endpointUrl()}`, () => {
    it('should create new note', () => {
      expect(testNote.statusCode).toBe(201)
      expect(testNote._body).toMatchObject({
        _id: testNote._body._id,
        text: expect.any(String),
        author: testUser.id,
        cooperation: testCooperation._id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw FORBIDDEN', async () => {
      const cooperation = await Cooperation.create({
        ...testCooperationData,
        initiator: mockedInitiatorId
      })

      const response = await app.post(endpointUrl(cooperation._id)).set('Cookie', [`accessToken=${accessToken}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for cooperation', async () => {
      const response = await app
        .post(endpointUrl(nonExistingCooperationId))
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Cooperation.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl(testCooperation._id))

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`UPDATE ${endpointUrl()}/:noteId`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl(testCooperation._id))

      expectError(401, UNAUTHORIZED, response)
    })

    it('should update a review by ID', async () => {
      const response = await app
        .patch(endpointUrl(testCooperation._id, testNote._body._id))
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateNoteData)

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl(testCooperation._id, nonExistingCooperationId))
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateNoteData)

      expectError(404, DOCUMENT_NOT_FOUND([Note.modelName]), response)
    })
  })

  describe(`DELETE ${endpointUrl()}/:noteId`, () => {
    it('should throw UNAUTHORIZED', async () => {
      const response = await app.delete(endpointUrl(testCooperation._id))

      expectError(401, UNAUTHORIZED, response)
    })

    it('should delete a note by ID', async () => {
      const response = await app
        .delete(endpointUrl(testCooperation._id, testNote._body._id))
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .delete(endpointUrl(testCooperation._id, nonExistingCooperationId))
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Note.modelName]), response)
    })
  })
})
