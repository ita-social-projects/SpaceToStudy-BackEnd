const { checkUsersForLastLogin } = require('~/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/cron-jobs/removeUnverifiedUsers')
const { openScheduledCooperationResources } = require('~/cron-jobs/openScheduledCooperationResources')
const { updateTotalOffers } = require('~/cron-jobs/updateTotalOffers')

const scheduledCronJobs = () => {
  checkUsersForLastLogin.start()
  removeUnverifiedUsers.start()
  openScheduledCooperationResources.start()
  updateTotalOffers.start()
}

module.exports = scheduledCronJobs
