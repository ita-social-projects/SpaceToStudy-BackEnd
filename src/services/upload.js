const azureStorage = require('azure-storage')
const {
  azureAccess: { STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST }
} = require('~/configs/config')

let blobService

const uploadService = {
  uploadFile: (name, buffer, containerName) => {
    blobService = azureStorage.createBlobService(STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST)

    const blobName = `${Date.now()}-${name}`

    return new Promise((resolve, reject) => {
      const stream = blobService.createWriteStreamToBlockBlob(containerName, blobName, (error) => {
        if (error) {
          return reject(new Error(`Failed to upload file: ${error.message}`))
        }
        resolve(blobName)
      })

      stream.on('error', (error) => {
        reject(new Error(`Stream error during upload: ${error.message}`))
      })

      stream.end(buffer)
    })
  },

  updateFile: async (name, newName, containerName) => {
    blobService = azureStorage.createBlobService(STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST)

    const blobUrl = `${AZURE_HOST}/${containerName}/${name}`
    const newBlobName = `${Date.now()}-${newName}`

    return new Promise((resolve, reject) => {
      blobService.startCopyBlob(blobUrl, containerName, newBlobName, (error) => {
        if (error) {
          return reject(new Error(`Failed to copy blob: ${error.message}`))
        }

        blobService.getBlobProperties(containerName, newBlobName, (err, properties) => {
          if (err) {
            return reject(new Error(`Failed to get blob properties: ${err.message}`))
          }

          if (properties.copy.status !== 'success') {
            return reject(new Error(`Blob copy did not succeed for: ${name}`))
          }

          uploadService.deleteFile(name, containerName)
          resolve(newBlobName)
        })
      })
    })
  },

  deleteFile: (fileName, containerName) => {
    blobService = azureStorage.createBlobService(STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST)

    return new Promise((resolve, reject) =>
      blobService.deleteBlobIfExists(containerName, fileName, (err, res) => {
        if (err) {
          reject(new Error(`Failed to delete file: ${err.message}`))
        }
        resolve(res)
      })
    ).catch((e) => e.message)
  }
}

module.exports = uploadService
