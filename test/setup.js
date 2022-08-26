const { existsSync } = require('fs')
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

const serverCleanup = async (server) => {
  if (existsSync('.env.test.local')) {
    await dropAllCollections()
  }
  await mongoose.connection.close()
  await server.close()
}

const dropAllCollections = async () => {
  const collections = await mongoose.connection.db.collections()
  const areDropped = []
  collections.forEach((collection) => {
    areDropped.push(collection.drop())
  })
  await Promise.all(areDropped)
}

module.exports = { serverInit, serverCleanup }
