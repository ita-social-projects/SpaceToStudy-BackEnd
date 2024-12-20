const cooperationService = require('~/services/cooperation')
const { updateScheduledResources } = require('~/cron-jobs/openScheduledCooperationResources')

jest.mock('~/services/cooperation', () => ({
  openScheduledCooperationResources: jest.fn()
}))

Object.defineProperty(global, 'performance', {
  writable: true
})

const mockedCurrentDate = new Date(2024, 12, 23, 0, 0, 0, 0)

describe('openScheduledCooperationResources cron-job', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern').setSystemTime(mockedCurrentDate)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should update scheduled resources if open from date is less or equal than the current date', async () => {
    await updateScheduledResources()

    expect(cooperationService.openScheduledCooperationResources).toHaveBeenCalledTimes(1)
    expect(cooperationService.openScheduledCooperationResources).toHaveBeenCalledWith(mockedCurrentDate)
  })
})
