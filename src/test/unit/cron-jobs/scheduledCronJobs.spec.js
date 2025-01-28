const { checkUsersForLastLogin } = require('~/cron-jobs/checkForLastLogin')
const { removeUnverifiedUsers } = require('~/cron-jobs/removeUnverifiedUsers')
const { openScheduledCooperationResources } = require('~/cron-jobs/openScheduledCooperationResources')
const { updateTotalOffers } = require('~/cron-jobs/updateTotalOffers')

const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')

jest.mock('~/cron-jobs/checkForLastLogin', () => ({ checkUsersForLastLogin: { start: jest.fn() } }))
jest.mock('~/cron-jobs/removeUnverifiedUsers', () => ({ removeUnverifiedUsers: { start: jest.fn() } }))
jest.mock('~/cron-jobs/openScheduledCooperationResources', () => ({
  openScheduledCooperationResources: { start: jest.fn() }
}))
jest.mock('~/cron-jobs/updateTotalOffers', () => ({ updateTotalOffers: { start: jest.fn() } }))

describe('scheduledCronJobs', () => {
  it('should call all the cron jobs', () => {
    scheduledCronJobs()

    expect(removeUnverifiedUsers.start).toHaveBeenCalled()
    expect(checkUsersForLastLogin.start).toHaveBeenCalled()
    expect(openScheduledCooperationResources.start).toHaveBeenCalled()
    expect(updateTotalOffers.start).toHaveBeenCalled()
  })
})
