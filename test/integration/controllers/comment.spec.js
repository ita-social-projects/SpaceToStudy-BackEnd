const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')

const Cooperation = require('~/models/cooperation')

const endpointUrl = (id = ':id') => `/cooperations/${id}/comments`

const nonExistingCooperationId = '19cf23e07281224fbbee3241'

const mockedInitiatorId = '649c1fc9c75d3e44440e3a15'

const testCooperationData = {
  price: 99,
  receiverRole: 'tutor',
  proficiencyLevel: 'Beginner',
  additionalInfo:
    'I don\'t like both Dark Arts and Voldemort that\'s why i want to learn your subject and became your student',
  receiver: '649c147ac75d3e44440e3a12',
  offer: '649c148cc75d3e44440e3a13',
  initiatorRole: 'student',
  needAction: 'tutor'
}

let testCommentData = {
  text: 'my comment'
}

describe('Comment controller', () => {
  let app, server, accessToken, testUser, testCooperation, testComment

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app)

    testUser = TokenService.validateAccessToken(accessToken)

    testCooperation = await Cooperation.create({
      initiator: testUser.id,
      ...testCooperationData
    })

    testComment = await app
      .post(endpointUrl(testCooperation._id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testCommentData)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`GET ${endpointUrl()}`, () => {
    it('get all comments', async () => {
      const response = await app.get(endpointUrl(testCooperation._id)).set('Authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.length).toBe(1)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toMatchObject({
        _id: testComment._body._id,
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

      const response = await app.post(endpointUrl(cooperation._id)).set('Authorization', `Bearer ${accessToken}`)

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for cooperation', async () => {
      const response = await app
        .post(endpointUrl(nonExistingCooperationId))
        .set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Cooperation.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl(testCooperation._id))

      expectError(401, UNAUTHORIZED, response)
    })
  })

  describe(`POST ${endpointUrl()}`, () => {
    it('should create new comment', () => {
      expect(testComment.statusCode).toBe(201)
      expect(testComment._body).toMatchObject({
        _id: testComment._body._id,
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

      const response = await app.post(endpointUrl(cooperation._id)).set('Authorization', `Bearer ${accessToken}`)

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND for cooperation', async () => {
      const response = await app
        .post(endpointUrl(nonExistingCooperationId))
        .set('Authorization', `Bearer ${accessToken}`)

      expectError(404, DOCUMENT_NOT_FOUND([Cooperation.modelName]), response)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl(testCooperation._id))

      expectError(401, UNAUTHORIZED, response)
    })
  })
})
