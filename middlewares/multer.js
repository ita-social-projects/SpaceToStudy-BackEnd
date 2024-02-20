const multer = require('multer')

const memoryStorage = multer.memoryStorage()
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5000000,
    fieldNameSize: 100
  }
})

module.exports = upload
