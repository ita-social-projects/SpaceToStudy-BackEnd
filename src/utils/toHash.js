const path = require('path')
const { v4: uuidv4 } = require('uuid')

const blobNameToHash = (name) => {
  const ext = path.extname(name)
  return `${Date.now()}-${uuidv4()}${ext}`
}

module.exports = blobNameToHash
