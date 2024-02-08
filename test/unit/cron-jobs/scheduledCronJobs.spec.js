const { checkUsersForLastLogin } = require('~/app/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/app/cron-jobs/removeUnverifiedUsers')
const scheduledCronJobs = require('~/app/cron-jobs/scheduledCronJobs')

jest.mock('~/app/cron-jobs/checkForLastLogin', () => ({ checkUsersForLastLogin: { start: jest.fn() } }))
jest.mock('~/app/cron-jobs/removeUnverifiedUsers', () => ({ removeUnverifiedUsers: { start: jest.fn() } }))

describe('scheduledCronJobs', () => {
  it('should call all the cron jobs', () => {
    scheduledCronJobs()

    expect(removeUnverifiedUsers.start).toHaveBeenCalled()
    expect(checkUsersForLastLogin.start).toHaveBeenCalled()
  })
})
