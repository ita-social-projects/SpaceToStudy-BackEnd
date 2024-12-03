const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const uploadService = require('~/services/upload')

jest.mock('@azure/storage-blob')

const file = {
  buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...',
  name: 'example.jpg',
  newName: 'exampleName.jpg'
}

const fileName = 'example.jpg'

describe('uploadService', () => {
  it('Should upload a file to Azure Blob Storage', async () => {
    const uploadDataMock = jest.fn().mockResolvedValue({})
    const getBlockBlobClientMock = jest.fn(() => ({
      uploadData: uploadDataMock
    }))
    const getContainerClientMock = jest.fn(() => ({
      getBlockBlobClient: getBlockBlobClientMock
    }))

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementationOnce(() => ({
      getContainerClient: getContainerClientMock
    }))

    const blobName = `${file.name}`

    const result = await uploadService.uploadFile(file.name, file.buffer, 'container')
    expect(result).toContain(blobName)
  })

  it('Should show an err during the upload', async () => {
    const uploadDataMock = jest.fn().mockRejectedValue(new Error('error'))
    const getBlockBlobClientMock = jest.fn(() => ({
      uploadData: uploadDataMock
    }))
    const getContainerClientMock = jest.fn(() => ({
      getBlockBlobClient: getBlockBlobClientMock
    }))

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementationOnce(() => ({
      getContainerClient: getContainerClientMock
    }))
    await expect(uploadService.uploadFile(file.name, file.buffer, 'container')).rejects.toThrow(
      'Failed to upload file: error'
    )
  })

  it('Should delete a file from Azure Blob Storage', async () => {
    const deleteIfExistsMock = jest.fn().mockResolvedValue({})
    const getBlockBlobClientMock = jest.fn().mockReturnValue({ deleteIfExists: deleteIfExistsMock })
    const getContainerClientMock = jest.fn().mockReturnValue({ getBlockBlobClient: getBlockBlobClientMock })

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementation(() => ({
      getContainerClient: getContainerClientMock
    }))

    const result = await uploadService.deleteFile(fileName)

    expect(result).toContain(fileName)
  })

  it('Should show an error during the delete', async () => {
    const deleteIfExistsMock = jest.fn().mockRejectedValue(new Error('error'))
    const getBlockBlobClientMock = jest.fn().mockReturnValue({ deleteIfExists: deleteIfExistsMock })
    const getContainerClientMock = jest.fn().mockReturnValue({ getBlockBlobClient: getBlockBlobClientMock })
    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementation(() => ({
      getContainerClient: getContainerClientMock
    }))

    expect(uploadService.deleteFile(fileName)).rejects.toThrow('Failed to delete file: error')
  })

  it('Should update a file in Azure Blob Storage successfully', async () => {
    const deleteIfExistsMock = jest.fn().mockResolvedValue({})
    const getPropertiesMock = jest.fn().mockResolvedValue({ copyStatus: 'success' })
    const pollUntilDoneMock = jest.fn().mockResolvedValue({})
    const beginCopyFromURLMock = jest.fn().mockReturnValue({ pollUntilDone: pollUntilDoneMock })
    const getBlockBlobClientMock = jest.fn().mockReturnValue({
      beginCopyFromURL: beginCopyFromURLMock,
      deleteIfExists: deleteIfExistsMock,
      getProperties: getPropertiesMock
    })
    const getContainerClientMock = jest.fn().mockReturnValue({ getBlockBlobClient: getBlockBlobClientMock })

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementation(() => ({
      getContainerClient: getContainerClientMock
    }))
    const result = await uploadService.updateFile(file.name, file.newName, file.buffer)

    expect(result).toContain(file.newName)
  })

  it('Should show an err on startCopyBlob during the update', async () => {
    const beginCopyFromURLMock = jest.fn().mockRejectedValue(new Error('error'))
    const deleteIfExistsMock = jest.fn().mockResolvedValue({})
    const getPropertiesMock = jest.fn().mockResolvedValue({ copyStatus: 'success' })
    const getBlockBlobClientMock = jest.fn().mockReturnValue({
      beginCopyFromURL: beginCopyFromURLMock,
      deleteIfExists: deleteIfExistsMock,
      getProperties: getPropertiesMock
    })
    const getContainerClientMock = jest.fn().mockReturnValue({ getBlockBlobClient: getBlockBlobClientMock })

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementation(() => ({
      getContainerClient: getContainerClientMock
    }))
    await expect(uploadService.updateFile(file.name, file.newName, 'container')).rejects.toThrow(
      'Failed to copy blob: error'
    )
  })

  it('Should show an err on getProperties during the update', async () => {
    const pollUntilDoneMock = jest.fn().mockResolvedValue({})
    const beginCopyFromURLMock = jest.fn().mockReturnValue({ pollUntilDone: pollUntilDoneMock })
    const deleteIfExistsMock = jest.fn().mockResolvedValue({})
    const getPropertiesMock = jest.fn().mockRejectedValue(new Error('error'))
    const getBlockBlobClientMock = jest.fn().mockReturnValue({
      beginCopyFromURL: beginCopyFromURLMock,
      deleteIfExists: deleteIfExistsMock,
      getProperties: getPropertiesMock
    })
    const getContainerClientMock = jest.fn().mockReturnValue({ getBlockBlobClient: getBlockBlobClientMock })

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementation(() => ({
      getContainerClient: getContainerClientMock
    }))
    await expect(uploadService.updateFile(file.name, file.newName, 'container')).rejects.toThrow(
      'Failed to get blob properties: error'
    )
  })

  it('Should show an error if blob copy does not succeed during the update', async () => {
    const pollUntilDoneMock = jest.fn().mockResolvedValue({})
    const beginCopyFromURLMock = jest.fn().mockReturnValue({ pollUntilDone: pollUntilDoneMock })
    const deleteIfExistsMock = jest.fn().mockResolvedValue({})
    const getPropertiesMock = jest.fn().mockResolvedValue({ copyStatus: 'failed' })
    const getBlockBlobClientMock = jest.fn().mockReturnValue({
      beginCopyFromURL: beginCopyFromURLMock,
      deleteIfExists: deleteIfExistsMock,
      getProperties: getPropertiesMock
    })
    const getContainerClientMock = jest.fn().mockReturnValue({ getBlockBlobClient: getBlockBlobClientMock })

    StorageSharedKeyCredential.mockImplementationOnce(() => ({}))
    BlobServiceClient.mockImplementation(() => ({
      getContainerClient: getContainerClientMock
    }))
    await expect(uploadService.updateFile(file.name, file.newName, 'container')).rejects.toThrow(
      'Blob copy did not succeed for: example.jpg'
    )
  })
})
