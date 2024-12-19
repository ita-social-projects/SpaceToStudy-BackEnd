const { checkUsersForLastLogin } = require('~/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/cron-jobs/removeUnverifiedUsers')
const { openScheduledCooperationResources } = require('~/cron-jobs/openScheduledCooperationResources')

const scheduledCronJobs = () => {
  checkUsersForLastLogin.start()
  removeUnverifiedUsers.start()
  openScheduledCooperationResources.start()
}

module.exports = scheduledCronJobs
