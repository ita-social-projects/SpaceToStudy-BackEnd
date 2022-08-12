require('module-alias/register')
require('./module-aliases')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()
const express = require('express')

const databaseInitialization = require('~/initialization/database')
const checkUsersForLastLogin = require('~/cron-jobs/checkForLastLogin')
const checkUserExistence = require('~/seed/checkUserExistence')
const initialization = require('~/initialization/initialization')
const {
  config: { SERVER_PORT }
} = require('~/configs/config')
const logger = require('~/logger/logger')

const app = express()

const start = async () => {
  try {
    databaseInitialization()
    await checkUserExistence()
    initialization(app)

    app.listen(SERVER_PORT, () => {
      logger.info(`Server is running on port ${SERVER_PORT}`), checkUsersForLastLogin.start()
    })
  } catch (err) {
    logger.error(err)
  }
}

start()
