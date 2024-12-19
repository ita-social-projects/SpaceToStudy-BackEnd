const { CronJob } = require('cron')

const cooperationService = require('~/services/cooperation')

const EVERY_MIDNIGHT = '00 00 * * *'
const UTC_TIME_ZONE = 'UTC'

const updateScheduledResources = async () => {
  const currentDate = new Date()

  await cooperationService.openScheduledCooperationResources(currentDate)
}

const openScheduledCooperationResources = new CronJob(
  EVERY_MIDNIGHT,
  updateScheduledResources,
  null,
  false,
  UTC_TIME_ZONE
)

module.exports = {
  openScheduledCooperationResources,
  updateScheduledResources
}
