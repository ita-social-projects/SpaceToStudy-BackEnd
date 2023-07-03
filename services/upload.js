const azureStorage = require('azure-storage')
const {
  azureAccess: { STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST }
} = require('~/configs/config')

let blobService

const uploadService = {
  uploadFile: (file, containerName) => {
    blobService = azureStorage.createBlobService(STORAGE_ACCOUNT, ACCESS_KEY, AZURE_HOST)

    const mainData = file.src.split(',')[1]

    const buffer = Buffer.from(mainData, 'base64')
    const blobName = `${Date.now()}-${file.name}`

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
