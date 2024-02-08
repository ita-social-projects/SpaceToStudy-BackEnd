const databaseInitialization = require('~/app/initialization/database')
const checkUserExistence = require('~/app/seed/checkUserExistence')
const checkCategoryExistence = require('~/app/seed/checkCategoryExistence')
const initialization = require('~/app/initialization/initialization')
const logger = require('~/app/logger/logger')
const {
  config: { SERVER_PORT }
} = require('~/app/configs/config')
const scheduledCronJobs = require('~/app/cron-jobs/scheduledCronJobs')

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
