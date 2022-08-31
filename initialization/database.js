const mongoose = require('mongoose')

const {
  config: { MONGODB_URL }
} = require('~/configs/config')
const logger = require('~/logger/logger')

const dropAllCollections = async () => {
  const collections = await mongoose.connection.db.collections()
  const areDropped = []
  collections.forEach((collection) => {
    areDropped.push(collection.drop())
  })
  await Promise.all(areDropped)
}

const checkForLocalDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    await dropAllCollections()
  }
}

const databaseInitialization = async () => {
  await mongoose.connect(MONGODB_URL)
  await checkForLocalDB()
  logger.info('Connected to MongoDB.')
}

module.exports = databaseInitialization
