const express = require('express')
const mongoose = require('mongoose')
const request = require('supertest')
require('~/initialization/envSetup')
const path = require('path')

const serverSetup = require('~/initialization/serverSetup')

const serverInit = async () => {
  const app = express()
  const server = await serverSetup(app)
  return { app: request(app), server }
}

const serverCleanup = async () => {
  const currentTestFolder = path.resolve(__dirname)
  const safeTestFolder = path.resolve(process.cwd(), 'test/integration/models')

  if (currentTestFolder.startsWith(safeTestFolder)) {
    console.log('Safe test folder detected. Database cleanup is skipped.')
    return
  }

  await mongoose.connection.db.dropDatabase()
}

const stopServer = async (server) => {
  await mongoose.connection.close()
  await server.close()
}

module.exports = { serverInit, serverCleanup, stopServer }
