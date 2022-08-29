const databaseInitialization = require('~/initialization/database')
const checkUserExistence = require('~/seed/checkUserExistence')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const {
  config: { SERVER_PORT }
} = require('~/configs/config')
const checkUsersForLastLogin = require('~/cron-jobs/checkForLastLogin')

const serverSetup = async (app) => {
  await databaseInitialization()
  await checkUserExistence()
  initialization(app)
  return app.listen(SERVER_PORT, () => {
    logger.info(`Server is running on port ${SERVER_PORT}`)
    if (process.env.NODE_ENV !== 'test') {
      checkUsersForLastLogin.start()
    }
  })
}

module.exports = serverSetup
