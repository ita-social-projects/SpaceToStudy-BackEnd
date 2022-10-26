const databaseInitialization = require('~/initialization/database')
const checkUserExistence = require('~/seed/checkUserExistence')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const {
  config: { SERVER_PORT }
} = require('~/configs/config')
const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')

const serverSetup = async (app) => {
  await databaseInitialization()
  await checkUserExistence()
  await checkCategoryExistence()
  initialization(app)
  return app.listen(SERVER_PORT, () => {
    logger.info(`Server is running on port ${SERVER_PORT}`)
    if (process.env.NODE_ENV !== 'test') {
      scheduledCronJobs()
    }
  })
}

module.exports = serverSetup
