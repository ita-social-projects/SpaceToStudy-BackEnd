require('module-alias/register')
require('./module-aliases')
require('~/app/initialization/envSetup')
const express = require('express')
const serverSetup = require('~/app/initialization/serverSetup')
const logger = require('~/app/logger/logger')

const app = express()

const start = async () => {
  try {
    await serverSetup(app)
  } catch (err) {
    logger.error(err)
  }
}

start()
