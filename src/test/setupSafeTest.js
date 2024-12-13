const mongoose = require('mongoose')
const express = require('express')
const request = require('supertest')
require('~/initialization/envSetup')
const initialization = require('~/initialization/initialization')

const connectToDatabase = async () => {
  const dbUri = process.env.MONGODB_URL_PROD

  if (!dbUri) {
    throw new Error('MONGODB_URL is not defined in the environment variables')
  }

  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    mongoose.connection.db.command = async (cmd, options) => {
      if (['insert', 'update', 'delete'].some((op) => cmd[op])) {
        throw new Error('Modification commands are disabled in read-only mode.')
      }
      return mongoose.connection.db.originalCommand ? mongoose.connection.db.originalCommand(cmd, options) : null
    }
  } catch (err) {
    console.error('Failed to connect to the database:', err.message)
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
