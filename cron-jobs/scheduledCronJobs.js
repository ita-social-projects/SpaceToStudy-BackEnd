const checkUsersForLastLogin = require('./checkForLastLogin')
const {removeUnverifiedUsers} = require('./removeUnverifiedUsers')

const scheduledCronJobs = () => {
  checkUsersForLastLogin.start()
  removeUnverifiedUsers.start()
}

module.exports = scheduledCronJobs
