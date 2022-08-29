const mongoose = require('mongoose')

const {
  config: { MONGODB_URL }
} = require('~/configs/config')
const logger = require('~/logger/logger')

const databaseInitialization = async () => {
  await mongoose.connect(MONGODB_URL)
  logger.info('Connected to MongoDB.')
}

module.exports = databaseInitialization
