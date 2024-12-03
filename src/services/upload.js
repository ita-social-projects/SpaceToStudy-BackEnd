const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const {
  azureAccess: { STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST }
} = require('~/configs/config')

let blobServiceClient
let containerClient
let blockBlobClient
let newBlockBlobClient

function getBlobServiceClient() {
  const credential = new StorageSharedKeyCredential(STORAGE_ACCOUNT, ACCESS_KEY)
  const _blobServiceClient = new BlobServiceClient(AZURE_HOST, credential)

  return _blobServiceClient
}

const uploadService = {
  uploadFile: async (name, buffer, containerName) => {
    const blobName = `${Date.now()}-${name}`
    blobServiceClient = getBlobServiceClient()
    containerClient = blobServiceClient.getContainerClient(containerName)
    blockBlobClient = containerClient.getBlockBlobClient(blobName)
    try {
      await blockBlobClient.uploadData(buffer)
      return blobName
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  },

  updateFile: async (name, newName, containerName) => {
    blobServiceClient = getBlobServiceClient()
    containerClient = blobServiceClient.getContainerClient(containerName)
    blockBlobClient = containerClient.getBlockBlobClient(name)

    const blobUrl = blockBlobClient.url
    const newBlobName = `${Date.now()}-${newName}`
    newBlockBlobClient = containerClient.getBlockBlobClient(newBlobName)

    let properties

    try {
      const copyResponse = await newBlockBlobClient.beginCopyFromURL(blobUrl)
      await copyResponse.pollUntilDone()
    } catch (error) {
      throw new Error(`Failed to copy blob: ${error.message}`)
    }
    try {
      properties = await newBlockBlobClient.getProperties()
    } catch (error) {
      throw new Error(`Failed to get blob properties: ${error.message}`)
    }

    if (properties.copyStatus !== 'success') throw new Error(`Blob copy did not succeed for: ${name}`)

    uploadService.deleteFile(name, containerName)
    return newName
  },

  deleteFile: async (blobName, containerName) => {
    blobServiceClient = getBlobServiceClient()
    containerClient = blobServiceClient.getContainerClient(containerName)
    blockBlobClient = containerClient.getBlockBlobClient(blobName)
    try {
      await blockBlobClient.deleteIfExists()
      return blobName
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }
}

module.exports = uploadService
