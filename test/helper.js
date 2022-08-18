const express = require('express')
const request = require('supertest')
const initialization = require('~/initialization/initialization')

const serverInit = () => {
  const app = express()
  initialization(app)
  return request(app)
}

module.exports = { serverInit }
