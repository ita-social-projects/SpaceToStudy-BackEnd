const mongoose = require('mongoose')

const {
  config: { MONGODB_URL }
} = require('~/configs/config')
const logger = require('~/logger/logger')

const DB_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true }

const databaseInitialization = async () => {
  await mongoose.connect(MONGODB_URL, DB_OPTIONS)
  logger.info('Connected to MongoDB.')
}

module.exports = databaseInitialization
