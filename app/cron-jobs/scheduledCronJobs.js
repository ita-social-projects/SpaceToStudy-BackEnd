const { checkUsersForLastLogin } = require('~/app/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/app/cron-jobs/removeUnverifiedUsers')

const scheduledCronJobs = () => {
  checkUsersForLastLogin.start()
  removeUnverifiedUsers.start()
}

module.exports = scheduledCronJobs
