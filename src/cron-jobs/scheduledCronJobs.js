const { checkUsersForLastLogin } = require('~/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/cron-jobs/removeUnverifiedUsers')

const scheduledCronJobs = () => {
  checkUsersForLastLogin.start()
  removeUnverifiedUsers.start()
}

module.exports = scheduledCronJobs
