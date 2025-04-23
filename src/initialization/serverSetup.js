const databaseInitialization = require('~/initialization/database')
const socketServerSetup = require('~/initialization/socketServerSetup')
const checkUserExistence = require('~/seed/checkUserExistence')
const checkCategoryExistence = require('~/seed/checkCategoryExistence')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const {
  config: { SERVER_PORT, USE_SSL }
} = require('~/configs/config')
const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')
const httpsServerSetup = require('~/initialization/httpsServerSetup')

const serverSetup = async (app) => {
  await databaseInitialization()
  await checkUserExistence()
  await checkCategoryExistence()
  initialization(app)

  const useSsl = USE_SSL === 'true'
  const server = useSsl ? httpsServerSetup(app) : app.listen(SERVER_PORT)

  socketServerSetup(server)

  logger.info(`Server is running on port ${SERVER_PORT}`)
  if (process.env.NODE_ENV !== 'test') {
    scheduledCronJobs()
  }

  return server
}

module.exports = serverSetup
