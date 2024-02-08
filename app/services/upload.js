const azureStorage = require('azure-storage')
const {
  azureAccess: { STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST }
} = require('~/app/configs/config')

let blobService

const uploadService = {
  uploadFile: (name, buffer, containerName) => {
    blobService = azureStorage.createBlobService(STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST)

    const blobName = `${Date.now()}-${name}`

    return new Promise((resolve, reject) => {
      const stream = blobService.createWriteStreamToBlockBlob(containerName, blobName, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(blobName)
        }
      })

      stream.on('error', (error) => {
        reject(error)
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
          reject(error)
        }

        blobService.getBlobProperties(containerName, newBlobName, (err, properties) => {
          if (err) {
            reject(err)
          }

          if (properties.copy.status !== 'success') {
            reject(name)
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
          reject(err)
        }
        resolve(res)
      })
    ).catch((e) => e.message)
  }
}

module.exports = uploadService
