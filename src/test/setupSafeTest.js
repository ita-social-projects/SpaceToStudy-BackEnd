const mongoose = require('mongoose')
const express = require('express')
const request = require('supertest')
require('~/initialization/envSetup')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const { createError } = require('~/utils/errorsHelper')
const { READ_ONLY_ERROR } = require('~/consts/errors')
const restrictedOperations = require('~/consts/restrictedOperations')

const connectToDatabase = async () => {
  const dbUri = process.env.MONGODB_URL_READONLY_TEST

  try {
    restrictedOperations.forEach((operation) => {
      mongoose.Model[operation] = async function () {
        throw createError(403, READ_ONLY_ERROR)
      }
    })

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

  const server = app.listen(process.env.SERVER_PORT || 8080)

  return { app: request(app), server }
}

const stopServer = async (server) => {
  await mongoose.connection.close()
  await server.close()
}

module.exports = { setupTestServer, stopServer }
