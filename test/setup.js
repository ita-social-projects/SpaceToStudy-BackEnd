const express = require('express')
const mongoose = require('mongoose')
const request = require('supertest')
require('~/initialization/envSetup')

const serverSetup = require('~/initialization/serverSetup')

const serverInit = async () => {
  const app = express()
  const server = await serverSetup(app)
  return { app: request(app), server }
}

const serverCleanup = async () => {
  await mongoose.connection.db.dropDatabase()
}

const stopServer = async (server) => {
  await mongoose.connection.close()
  await server.close()
}

module.exports = { serverInit, serverCleanup, stopServer }
