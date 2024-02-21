const { checkUsersForLastLogin } = require('~/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/cron-jobs/removeUnverifiedUsers')
const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')

jest.mock('~/cron-jobs/checkForLastLogin', () => ({ checkUsersForLastLogin: { start: jest.fn() } }))
jest.mock('~/cron-jobs/removeUnverifiedUsers', () => ({ removeUnverifiedUsers: { start: jest.fn() } }))

describe('scheduledCronJobs', () => {
  it('should call all the cron jobs', () => {
    scheduledCronJobs()

    expect(removeUnverifiedUsers.start).toHaveBeenCalled()
    expect(checkUsersForLastLogin.start).toHaveBeenCalled()
  })
})
