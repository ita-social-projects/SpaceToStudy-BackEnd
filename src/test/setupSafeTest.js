const mongoose = require('mongoose')
const express = require('express')
const request = require('supertest')
require('~/initialization/envSetup')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const { restrictOperations } = require('~/test/helpers')
const { restrictedOperations } = require('~/test/test-consts')
const {
  config: { MONGODB_URL_READONLY_TEST, SERVER_PORT }
} = require('~/configs/config')

const connectToDatabase = async () => {
  const dbUri = MONGODB_URL_READONLY_TEST

  try {
    restrictOperations(restrictedOperations, mongoose.Model)

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    logger.info('Connected to MongoDB in read-only mode.')
  } catch (err) {
    logger.error(`Failed to connect to the database: ${err.message}`, { error: err })
    process.exit(1)
  }
}

const setupTestServer = async () => {
  const app = express()

  await connectToDatabase()
  initialization(app)

  const server = app.listen(SERVER_PORT ?? 8080)

  return { app: request(app), server }
}

const stopServer = async (server) => {
  await mongoose.connection.close()
  await server.close()
}

module.exports = { setupTestServer, stopServer }
