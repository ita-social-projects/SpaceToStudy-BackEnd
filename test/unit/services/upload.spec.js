const azureStorage = require('azure-storage')
const uploadService = require('~/services/upload')

jest.mock('azure-storage')

describe('uploadService`', () => {
  it('Should upload a file to Azure Blob Storage', async () => {
    const file = {
      buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
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

    const result = await uploadService.uploadFile(file.name, file.buffer)

    expect(result).toContain(blobName)
  }),
    it('Should show an err during the upload', async () => {
      const file = {
        buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
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
        await uploadService.uploadFile(file.name, file.buffer)
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
  it('should update a file in Azure Blob Storage successfully', async () => {
    const file = {
      buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example.jpg',
      newName: 'exampleName.jpg'
    }
    const blobNameNew = `${file.newName}`

    const fn = (blobUrl, containerName, newBlobName, cb) => {
      cb(null, newBlobName)
    }
    const fnP = (container, blobName, cb) => {
      cb(null, { copy: { status: 'success' } })
    }

    const blobServiceStub = {
      startCopyBlob: fn,
      getBlobProperties: fnP
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    const result = await uploadService.updateFile(file.name, file.newName, file.buffer)

    expect(result).toContain(blobNameNew)
  })
  it('Should show an err on startCopyBlob during the update', async () => {
    const file = {
      buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example.jpg',
      newName: 'exampleName.jpg'
    }
    const fn = (blobUrl, containerName, newBlobName, cb) => {
      cb('error', newBlobName)
    }
    const blobServiceStub = {
      startCopyBlob: fn
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    try {
      await uploadService.updateFile(file.name, file.newName, file.buffer)
    } catch (err) {
      expect(err).toBe('error')
    }
  })

  it('Should show an err on getBlobProperties during the update', async () => {
    const file = {
      buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
      name: 'example.jpg',
      newName: 'exampleName.jpg'
    }
    const fn = (blobUrl, containerName, newBlobName, cb) => {
      cb(null, newBlobName)
    }
    const fnP = (container, blobName, cb) => {
      cb('error', blobName)
    }
    const blobServiceStub = {
      startCopyBlob: fn,
      getBlobProperties: fnP
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    try {
      await uploadService.updateFile(file.name, file.newName, file.buffer)
    } catch (err) {
      expect(err).toBe('error')
    }
  })
})
