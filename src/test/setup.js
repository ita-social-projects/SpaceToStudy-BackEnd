const express = require('express')
const mongoose = require('mongoose')
const request = require('supertest')
require('~/initialization/envSetup')
const { createError } = require('~/utils/errorsHelper')
const { RESTRICTED_PATH } = require('~/consts/errors')
const { isRestrictedPath } = require('~/utils/isRestrictedPath')

const serverSetup = require('~/initialization/serverSetup')

const serverInit = async () => {
  const app = express()
  const server = await serverSetup(app)
  return { app: request(app), server }
}

const serverCleanup = async () => {
  if (isRestrictedPath('/models/')) {
    throw createError(403, RESTRICTED_PATH('serverCleanup', '/models/'))
  }

  await mongoose.connection.db.dropDatabase()
}

const stopServer = async (server) => {
  await mongoose.connection.close()
  await server.close()
}

module.exports = { serverInit, serverCleanup, stopServer }
