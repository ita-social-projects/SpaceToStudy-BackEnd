const azureStorage = require('azure-storage')
const uploadService = require('~/services/upload')

jest.mock('azure-storage')

const getBlobName = (containerName, blobName, cb) => {
  cb(null, blobName)
}

const getBlobNameWithError = (containerName, blobName, cb) => {
  cb(new Error('error'), blobName)
}

const getNewBlobName = (blobUrl, containerName, newBlobName, cb) => {
  cb(null, newBlobName)
}

const getBlobPropertiesWithSuccessStatus = (container, blobName, cb) => {
  cb(null, { copy: { status: 'success' } })
}

const getBlobPropertiesWithFailedStatus = (container, blobName, cb) => {
  cb(null, { copy: { status: 'failed' } })
}

const getNewBlobNameWithError = (blobUrl, containerName, newBlobName, cb) => {
  cb(new Error('error'), newBlobName)
}

const getBlobPropertiesStatusWithError = (container, blobName, cb) => {
  cb(new Error('error'), blobName)
}

const file = {
  buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
  name: 'example.jpg',
  newName: 'exampleName.jpg'
}

const fileName = 'example.jpg'

describe('uploadService', () => {
  it('Should upload a file to Azure Blob Storage', async () => {
    const blobName = `${file.name}`

    const blobServiceStub = {
      createWriteStreamToBlockBlob: getBlobName
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    const result = await uploadService.uploadFile(file.name, file.buffer)

    expect(result).toContain(blobName)
  })

  it('Should show an err during the upload', async () => {
    const blobServiceStub = {
      createWriteStreamToBlockBlob: getBlobNameWithError
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    await expect(uploadService.uploadFile(file.name, file.buffer, 'container')).rejects.toThrow(
      'Failed to upload file: error'
    )
  })

  it('Should delete a file from Azure Blob Storage', async () => {
    const blobServiceStub = {
      deleteBlobIfExists: getBlobName
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    const result = await uploadService.deleteFile(fileName)

    expect(result).toContain(fileName)
  })

  it('Should show an error during the delete', async () => {
    const blobServiceStub = {
      deleteBlobIfExists: getBlobNameWithError
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    try {
      await uploadService.deleteFile(fileName)
    } catch (err) {
      expect(err).toBe('error')
    }
  })

  it('Should update a file in Azure Blob Storage successfully', async () => {
    const blobNameNew = `${file.newName}`

    const blobServiceStub = {
      startCopyBlob: getNewBlobName,
      getBlobProperties: getBlobPropertiesWithSuccessStatus
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    const result = await uploadService.updateFile(file.name, file.newName, file.buffer)

    expect(result).toContain(blobNameNew)
  })

  it('Should show an err on startCopyBlob during the update', async () => {
    const blobServiceStub = {
      startCopyBlob: getNewBlobNameWithError
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    await expect(uploadService.updateFile(file.name, file.newName, 'container')).rejects.toThrow(
      'Failed to copy blob: error'
    )
  })

  it('Should show an err on getBlobProperties during the update', async () => {
    const blobServiceStub = {
      startCopyBlob: getNewBlobName,
      getBlobProperties: getBlobPropertiesStatusWithError
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    await expect(uploadService.updateFile(file.name, file.newName, 'container')).rejects.toThrow(
      'Failed to get blob properties: error'
    )
  })

  it('Should show an error if blob copy does not succeed during the update', async () => {
    const blobServiceStub = {
      startCopyBlob: getNewBlobName,
      getBlobProperties: getBlobPropertiesWithFailedStatus
    }
    azureStorage.createBlobService.mockImplementationOnce(() => blobServiceStub)

    await expect(uploadService.updateFile(file.name, file.newName, 'container')).rejects.toThrow(
      'Blob copy did not succeed for: example.jpg'
    )
  })
})
