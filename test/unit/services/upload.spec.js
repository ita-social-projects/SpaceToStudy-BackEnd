const azureStorage = require('azure-storage')
const uploadService = require('~/services/upload')

jest.mock('azure-storage')

describe('uploadService', () => {
  it('Should upload a file to Azure Blob Storage', async () => {
    const file = {
      src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example.jpg'
    }
    const blobName = `${file.name}`

    const fn = (containerName, blobName, cb) => {
      cb(null, blobName)
    }

    const blobServiceStub = {
      createWriteStreamToBlockBlob: fn
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    const result = await uploadService.uploadFile(file)

    expect(result).toContain(blobName)
  }),
    it('Should show an error during the upload', async () => {
      const file = {
        src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
        name: 'example.jpg'
      }

      const fn = (containerName, blobName, cb) => {
        cb('error', blobName)
      }

      const blobServiceStub = {
        createWriteStreamToBlockBlob: fn
      }
      azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

      try {
        await uploadService.uploadFile(file)
      } catch (err) {
        expect(err).toBe('error')
      }
    }),
    it('Should delete a file from Azure Blob Storage', async () => {
      const fileName = 'example.jpg'

      const fn = (containerName, blobName, cb) => {
        cb(null, blobName)
      }

      const blobServiceStub = {
        deleteBlobIfExists: fn
      }
      azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

      const result = await uploadService.deleteFile(fileName)

      expect(result).toContain(fileName)
    }),
    it('Should show an error during the delete', async () => {
      const fileName = 'example.jpg'

      const fn = (containerName, blobName, cb) => {
        cb('error', blobName)
      }

      const blobServiceStub = {
        deleteBlobIfExists: fn
      }
      azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

      try {
        await uploadService.deleteFile(fileName)
      } catch (err) {
        expect(err).toBe('error')
      }
    })
})
