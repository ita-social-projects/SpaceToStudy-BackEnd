const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/app/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/app/consts/errors')

jest.mock('azure-storage', () => {
  const fn = (containerName, blobName, cb) => {
    cb(null, blobName)
  }

  const blobServiceStub = {
    createWriteStreamToBlockBlob: fn
  }

  return {
    createBlobService: jest.fn(() => blobServiceStub)
  }
})

const testFile = {
  originalname: 'example.pdf',
  description: 'Here is everything you need to study this subject.',
  buffer: '65bed8ef260f18d04ab22da3',
  size: 1524
}

jest.mock('multer', () => {
  const multer = () => ({
    array: () => {
      return (req, res, next) => {
        req.body = { description: 'Here is everything you need to study this subject.' }
        req.files = [testFile]
        return next()
      }
    }
  })
  multer.memoryStorage = () => jest.fn()
  return multer
})

const endpointUrl = '/attachments/'

let tutorUser = {
  role: 'tutor',
  firstName: 'albus',
  lastName: 'dumbledore',
  email: 'lovemagic@gmail.com',
  password: 'supermagicpass123',
  appLanguage: 'en',
  FAQ: { student: [{ question: 'question1', answer: 'answer1' }] },
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: 'tutor'
}

describe('Attachments controller', () => {
  let app, server, accessToken, tutorAccessToken, testAttachmentsResponse

  beforeAll(async () => {
    ; ({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, tutorUser)
    tutorAccessToken = await testUserAuthentication(app)

    testAttachmentsResponse = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ testFile })
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a attachment', async () => {
      expect(testAttachmentsResponse.statusCode).toBe(201)
      expect(testAttachmentsResponse.body[0]).toMatchObject({
        _id: expect.any(String),
        author: expect.any(String),
        description: 'Here is everything you need to study this subject.',
        fileName: 'example.pdf',
        link: expect.any(String),
        size: 1524,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      accessToken = await testUserAuthentication(app)

      const response = await app
        .post(endpointUrl)
        .set('Cookie', [`accessToken=${tutorAccessToken}`])
        .send(testFile)

      expectError(403, FORBIDDEN, response)
    })
  })
})
