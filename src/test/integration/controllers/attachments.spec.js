const { serverCleanup, serverInit, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN, DOCUMENT_NOT_FOUND } = require('~/consts/errors')
const TokenService = require('~/services/token')
const Attachment = require('~/models/attachment')
const uploadService = require('~/services/upload')

const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')

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

const updateData = {
  fileName: 'newFileName.pdf'
}

const nonExistingAttachmentId = '64a51e41de4debbccf0b3111'

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
  let app, server, accessToken, tutorAccessToken, testAttachmentsResponse, currentUser, testAttachmentId

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, tutorUser)
    tutorAccessToken = await testUserAuthentication(app)
    currentUser = TokenService.validateAccessToken(accessToken)

    testAttachmentsResponse = await app
      .post(endpointUrl)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ testFile })
    testAttachmentId = testAttachmentsResponse.body[0]._id
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

  describe(`GET ${endpointUrl}`, () => {
    it('should get all attachments', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(200)
      expect(Array.isArray(response.body.items)).toBeTruthy()
      expect(response.body).toEqual({
        items: [
          {
            _id: expect.any(String),
            author: currentUser.id,
            fileName: 'example.pdf',
            description: 'Here is everything you need to study this subject.',
            link: expect.any(String),
            size: 1524,
            category: null,
            resourceType: RESOURCES_TYPES_ENUM[2],
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ],
        count: 1
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.get(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app.get(endpointUrl).set('Cookie', [`accessToken=${tutorAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`PATCH ${endpointUrl}`, () => {
    it('should update an attachment fileName', async () => {
      await app
        .patch(endpointUrl + testAttachmentId)
        .send({ fileName: 'fileName.pdf' })
        .set('Cookie', [`accessToken=${accessToken}`])

      const attachmentsResponse = await app
        .get(endpointUrl + '?fileName:fileName.pdf')
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(attachmentsResponse.body).toMatchObject({
        items: [
          {
            _id: expect.any(String),
            author: currentUser.id,
            fileName: 'example.pdf',
            description: 'Here is everything you need to study this subject.',
            link: expect.any(String),
            size: 1524,
            category: null,
            resourceType: RESOURCES_TYPES_ENUM[2],
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ],
        count: 1
      })
    })

    it('should update an attachment file name and link', async () => {
      const newFileName = 'newFileName'
      const newLink = 'newLink'
      const updateAttachmentSpy = jest.spyOn(uploadService, 'updateFile').mockResolvedValue(newLink)

      await app
        .patch(endpointUrl + testAttachmentId)
        .send({ fileName: newFileName })
        .set('Cookie', [`accessToken=${accessToken}`])

      const attachmentsResponse = await app
        .get(endpointUrl + '?fileName:newFileName')
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(attachmentsResponse.body).toMatchObject({
        items: [
          {
            _id: expect.any(String),
            author: currentUser.id,
            category: null,
            createdAt: expect.any(String),
            description: 'Here is everything you need to study this subject.',
            fileName: `${newFileName}.pdf`,
            link: newLink,
            resourceType: RESOURCES_TYPES_ENUM[2],
            size: 1524,
            updatedAt: expect.any(String)
          }
        ],
        count: 1
      })

      expect(updateAttachmentSpy).toHaveBeenCalledWith(expect.any(String), `${newFileName}.pdf`, 'attachment')
    })

    it('should update an attachment description', async () => {
      await app
        .patch(endpointUrl + testAttachmentId)
        .send({ description: 'newDescription' })
        .set('Cookie', [`accessToken=${accessToken}`])

      const attachmentsResponse = await app
        .get(endpointUrl + '?description:newDescription')
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(attachmentsResponse.body).toMatchObject({
        items: [
          {
            _id: expect.any(String),
            author: currentUser.id,
            fileName: 'example.pdf',
            description: 'newDescription',
            link: expect.any(String),
            size: 1524,
            category: null,
            resourceType: RESOURCES_TYPES_ENUM[2],
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ],
        count: 1
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl + testAttachmentId).send(updateData)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const token = await testUserAuthentication(app, { role: 'tutor' })
      const response = await app
        .patch(endpointUrl + testAttachmentId)
        .send(updateData)
        .set('Cookie', [`accessToken=${token}`])

      expectError(403, FORBIDDEN, response)
    })

    it('should throw DOCUMENT_NOT_FOUND', async () => {
      const response = await app
        .patch(endpointUrl + nonExistingAttachmentId)
        .set('Cookie', [`accessToken=${accessToken}`])

      expectError(404, DOCUMENT_NOT_FOUND([Attachment.modelName]), response)
    })
  })

  describe(`DELETE ${endpointUrl}:id`, () => {
    it('should delete attachment by ID', async () => {
      const response = await app.delete(endpointUrl + testAttachmentId).set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw FORBIDDEN', async () => {
      const token = await testUserAuthentication(app, { role: 'tutor' })
      const response = await app.delete(endpointUrl + testAttachmentId).set('Cookie', [`accessToken=${token}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
